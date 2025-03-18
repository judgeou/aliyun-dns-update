import Alidns20150109, * as $Alidns20150109 from '@alicloud/alidns20150109';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import { config } from 'dotenv'
import https from 'https'
import http from 'http'
import dayjs from 'dayjs'
import os from 'node:os'
import { spawn } from 'child_process'
import { TextDecoder } from 'util'

config();

const { ALIBABA_CLOUD_DOMAIN_NAME, ALIBABA_CLOUD_DOMAIN_RRKEYWORD } = process.env

function extractNumber (str: string, c: string) {
  const regex = new RegExp(`(\\d+)${c}`)
  const match = str.match(regex) || []
  return Number(match[1] || 0)
}

function extractSecond (str: string) {
  return extractNumber(str, 'd') * 86400 + extractNumber(str, 'h') * 3600 + extractNumber(str, 'm') * 60 + extractNumber(str, 's')
}

async function exec_return_string (cmd, args, encoding = 'utf-8') : Promise<string> {
  return new Promise((resolve, reject) => {
    let process = spawn(cmd, args)
    let buffers = [] as any[]
  
    process.stdout.on('data', async (data: any) => {
      buffers.push(data)
    })
  
    process.stderr.on('data', (data) => {
      reject(data)
    })

    process.on('close', async code => {
      if (code === 0) {
        let bdata = Buffer.concat(buffers)
        const decoder = new TextDecoder(encoding)
        resolve(decoder.decode(bdata))
      }
    })
  })
}

class Client {
  /**
   * 使用AK&SK初始化账号Client
   * @param accessKeyId
   * @param accessKeySecret
   * @return Client
   * @throws Exception
   */
  static createClient (): Alidns20150109 {
    let config = new $OpenApi.Config({
      // 必填，您的 AccessKey ID
      accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
      // 必填，您的 AccessKey Secret
      accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
    });
    // 访问的域名
    config.endpoint = `alidns.cn-shenzhen.aliyuncs.com`;
    return new Alidns20150109(config);
  }
}

async function getDomainIp (type = 'A', rrkeyword?: string) {
  const client = Client.createClient();
  const describeDomainRecordsRequest = new $Alidns20150109.DescribeDomainRecordsRequest({
    domainName: ALIBABA_CLOUD_DOMAIN_NAME,
    type: type,
    RRKeyWord: rrkeyword || ALIBABA_CLOUD_DOMAIN_RRKEYWORD
  })
  const runtime = new $Util.RuntimeOptions({});
  try {
    const { body } = await client.describeDomainRecordsWithOptions(describeDomainRecordsRequest, runtime)
    const record = body.domainRecords?.record

    if (record && record.length > 0) {
      return record
    }
  } catch (err) {
    Util.assertAsString((err as any).message)
  }

  return []
}

async function setDomainIp (ip: string, recordId: string, type = 'A', rrkeyword?: string) {
  const client = Client.createClient();
  const updateDomainRecordRequest = new $Alidns20150109.UpdateDomainRecordRequest({
    recordId,
    RR: rrkeyword || ALIBABA_CLOUD_DOMAIN_RRKEYWORD,
    type,
    value: ip,
  })
  const runtime = new $Util.RuntimeOptions({ });
  await client.updateDomainRecordWithOptions(updateDomainRecordRequest, runtime);
}

async function addDomainIp (ip: string, type = 'A', rrkeyword?: string) {
  const client = Client.createClient();
  const addDomainRecordRequest = new $Alidns20150109.AddDomainRecordRequest({
    domainName: ALIBABA_CLOUD_DOMAIN_NAME,
    RR: rrkeyword || ALIBABA_CLOUD_DOMAIN_RRKEYWORD,
    type: type,
    value: ip,
  })
  const runtime = new $Util.RuntimeOptions({ });
  await client.addDomainRecordWithOptions(addDomainRecordRequest, runtime);
}

async function deleteDomainIp (recordId: string) {
  const client = Client.createClient();
  const deleteDomainRecordRequest = new $Alidns20150109.DeleteDomainRecordRequest({
    recordId,
  })
  const runtime = new $Util.RuntimeOptions({ });
  await client.deleteDomainRecordWithOptions(deleteDomainRecordRequest, runtime);
}

async function getMyIp () {
  return new Promise<string>((resolve, reject) => {
    const req = http.get('http://x.oza-oza.top:4322', (res) => {
      let data = '';
  
      res.on('data', (chunk) => {
        data += chunk;
      });
    
      res.on('end', () => {
        resolve(data)
      });

      res.on('error', reject)
    })

    req.on('error', reject)
  })
}

function getMyIpv6 () {
  const interfaces = os.networkInterfaces()
  const faceNames = Object.keys(interfaces)
  let ipv6arr = [] as string[]

  for (let faceName of faceNames) {
    const iface = interfaces[faceName]
    const iface_r = iface?.filter(item => 
      item.family === 'IPv6' && 
      item.internal === false &&
      /^2\w\w\w:.+/.test(item.address)
    )
    const iface_r_addr = iface_r?.map(item => item.address)
    console.log(iface_r)

    ipv6arr = ipv6arr.concat(iface_r_addr || [])
  }

  return ipv6arr
}

async function getIpv6Array () {
  const data = await exec_return_string('netsh', ['interface', 'ipv6', 'show', 'address'], 'gbk')
  const arr1 = data.match(/(公用|DHCP) +首选项 +\w+ +\w+ +[a-z0-9\:]+/gm) || []
  const arr2 = arr1.map((item: string) => {
    const m = item.match(/(公用|DHCP) +首选项 +\w+ +(\w+) +([a-z0-9\:]+)/) || []
    return {
      life: extractSecond(m[2]),
      address: m[3]
    }
  })

  return arr2
}

async function getIpv6LongLife () {
  const arr2 = await getIpv6Array()
  const finalAddress = arr2.sort((a, b) => b.life - a.life)[0]

  return finalAddress
}

async function getipv6_remote () {
  const data = await new Promise<string>((resolve, reject) => {
    const chunks = [] as Buffer[]
    const req = https.request({
      method: 'GET',
      hostname: 'ipv6.lookup.test-ipv6.com',
      path: '/ip/?asn=1&testdomain=test-ipv6.com&testname=test_asn6',
      port: 443
    }, res => {
      res.on('data', chunk => {
        chunks.push(chunk)
      })
  
      res.on('end', () => {
        resolve(Buffer.concat(chunks).toString())
      })

      res.on('error', reject)
    })

    req.on('error', reject)
    req.end()
  })

  const info = JSON.parse(data)
  return info.ip
}

async function updateIp () {
  const domainIp = (await getDomainIp())[0]
  const myIp = await getMyIp()
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

  if (domainIp && domainIp.value !== myIp) {
    console.log(`[${now}] ipv4 changed: ${myIp}`)
    await setDomainIp(myIp, domainIp.recordId!)
    console.log('ipv4 updated')
  } else {
    console.log(`[${now}] ipv4 not changed`)
  }
}

async function updateIpv6_mutil () {
  const local_ipv6_list = await getIpv6Array()
  const remote_ipv6_list = await getDomainIp('AAAA')
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

  for (let local_ipv6 of local_ipv6_list) {
    const remote_ipv6 = remote_ipv6_list.find(item => item.value === local_ipv6.address)

    if (!remote_ipv6) {
      await addDomainIp(local_ipv6.address, 'AAAA')
      console.log(`[${now}] 添加新的IPv6地址: ${local_ipv6.address}`)
    } else {
      if (local_ipv6.address !== remote_ipv6.value) {
        await setDomainIp(local_ipv6.address, remote_ipv6.recordId!, 'AAAA')
        console.log(`[${now}] 更新IPv6地址: ${local_ipv6.address}`)
      }
    }
  }

  for (let remote_ipv6 of remote_ipv6_list) {
    const local_ipv6 = local_ipv6_list.find(item => item.address === remote_ipv6.value)
    if (!local_ipv6) {
      await deleteDomainIp(remote_ipv6.recordId!)
      console.log(`[${now}] 删除无效的IPv6地址: ${remote_ipv6.value}`)
    }
  }

  console.log(`[${now}] 完成IPv6地址更新`)
}

async function updateIpv6 () {
  const domainIpv6 = (await getDomainIp('AAAA'))[0]
  const domainIpv6_2 = (await getDomainIp('AAAA', 'ipv6'))[0]
  let myIpv6: any = null
  try {
    myIpv6 = await getipv6_remote()
  } catch {
    myIpv6 = (await getIpv6LongLife()).address
  }

  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

  if (myIpv6 && domainIpv6 && domainIpv6.value !== myIpv6) {
    console.log(`[${now}] ipv6 changed: ${myIpv6}`)
    await setDomainIp(myIpv6, domainIpv6.recordId!, 'AAAA')
    await setDomainIp(myIpv6, domainIpv6_2.recordId!, 'AAAA', 'ipv6')
    console.log('ipv6 updated')
  } else {
    console.log(`[${now}] ipv6 not changed`)
  }
}

async function wait (ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

async function main () {
  while (1) {
    try {
      updateIp().catch(console.log)
      updateIpv6_mutil().catch(console.log)
    } catch (err) {
      console.error(err)
    }
    await wait(1000 * 60)
  }
}

main()
