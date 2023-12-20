import Alidns20150109, * as $Alidns20150109 from '@alicloud/alidns20150109';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import { config } from 'dotenv'
import https from 'https'
import dayjs from 'dayjs'
import os from 'node:os'

config();

const { ALIBABA_CLOUD_DOMAIN_NAME, ALIBABA_CLOUD_DOMAIN_RRKEYWORD } = process.env

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

async function getDomainIp (type = 'A') {
  const client = Client.createClient();
  const describeDomainRecordsRequest = new $Alidns20150109.DescribeDomainRecordsRequest({
    domainName: ALIBABA_CLOUD_DOMAIN_NAME,
    type: type,
    RRKeyWord: ALIBABA_CLOUD_DOMAIN_RRKEYWORD
  })
  const runtime = new $Util.RuntimeOptions({});
  try {
    const { body } = await client.describeDomainRecordsWithOptions(describeDomainRecordsRequest, runtime)
    const record = body.domainRecords?.record

    if (record && record.length > 0) {
      return record[0]
    }
  } catch (err) {
    Util.assertAsString((err as any).message)
  }
}

async function setDomainIp (ip: string, recordId: string, type = 'A') {
  const client = Client.createClient();
  const updateDomainRecordRequest = new $Alidns20150109.UpdateDomainRecordRequest({
    recordId,
    RR: "@",
    type,
    value: ip,
  })
  const runtime = new $Util.RuntimeOptions({ });
  await client.updateDomainRecordWithOptions(updateDomainRecordRequest, runtime);
}

async function getMyIp () {
  return new Promise<string>((resolve, reject) => {
    const req = https.get('https://x.oza-oza.top:4321', (res) => {
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

  for (let faceName of faceNames) {
    const iface = interfaces[faceName]
    const iface_r = iface?.filter(item => 
      item.family === 'IPv6' && 
      item.internal === false &&
      /^2\w\w\w:.+/.test(item.address)
    )
    if (iface_r && iface_r?.length > 0) {
      iface_r.sort((a, b) => a.address.length - b.address.length)
      return iface_r[0].address
    }
  }

  return null
}

async function updateIp () {
  const domainIp = await getDomainIp()
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

async function updateIpv6 () {
  const domainIpv6 = await getDomainIp('AAAA')
  const myIpv6 = getMyIpv6()
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

  if (myIpv6 && domainIpv6 && domainIpv6.value !== myIpv6) {
    console.log(`[${now}] ipv6 changed: ${myIpv6}`)
    await setDomainIp(myIpv6, domainIpv6.recordId!, 'AAAA')
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
      await updateIp()
      await updateIpv6()
    } catch (err) {
      console.error(err)
    }
    await wait(1000 * 60)
  }
}

main()
