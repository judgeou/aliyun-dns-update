import https from 'https'

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

async function main () {
  while (1) {
    try {
      const ip = await getipv6_remote()
      console.log(`${new Date()} ${ip}`)
      await new Promise(r => setTimeout(r, 60000))
    } catch (err) {
      console.error(err)
    }
  }
}

main()