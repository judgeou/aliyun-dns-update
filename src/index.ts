import Alidns20150109, * as $Alidns20150109 from '@alicloud/alidns20150109';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import { config } from 'dotenv'
import https from 'https'
import dayjs from 'dayjs'

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

async function getDomainIp () {
  const client = Client.createClient();
  const describeDomainRecordsRequest = new $Alidns20150109.DescribeDomainRecordsRequest({
    domainName: ALIBABA_CLOUD_DOMAIN_NAME,
    type: 'A',
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

async function setDomainIp (ip: string, recordId: string) {
  const client = Client.createClient();
  const updateDomainRecordRequest = new $Alidns20150109.UpdateDomainRecordRequest({
    recordId,
    RR: "@",
    type: "A",
    value: ip,
  })
  const runtime = new $Util.RuntimeOptions({ });
  await client.updateDomainRecordWithOptions(updateDomainRecordRequest, runtime);
}

async function getMyIp () {
  return new Promise<string>((resolve, reject) => {
    https.get('https://x.oza-oza.top:4321', (res) => {
      let data = '';
  
      res.on('data', (chunk) => {
        data += chunk;
      });
    
      res.on('end', () => {
        resolve(data)
      });

      res.on('error', reject)
    })
  })
}

async function updateIp () {
  const domainIp = await getDomainIp()
  const myIp = await getMyIp()
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

  if (domainIp && domainIp.value !== myIp) {
    console.log(`[${now}] ip changed: ${myIp}`)
    await setDomainIp(myIp, domainIp.recordId!)
    console.log('ip updated')
  } else {
    console.log(`[${now}] ip not changed`)
  }
}

async function wait (ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

async function main () {
  while (1) {
    updateIp()
    await wait(1000 * 60)
  }
}

main()
