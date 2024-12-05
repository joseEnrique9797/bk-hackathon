const FUNCTOR_API_KEY = 'ffe2b1bd-5e50-4f7f-82b3-4307f66a17c2'
function createSmartAccount(ownerAddress: string, allowedAddresses: string[]) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'functor_createSmartAccount',
      params: [
        ownerAddress,
        allowedAddresses,
        '0xabcdef1234567890abcdef1234567890abcdef14', // paymasterAddress - replace with actual paymaster address
      ],
    })
    console.log('requestBody...:', requestBody)
    console.log('FUNCTOR_API_KEY...:', FUNCTOR_API_KEY)

    fetch('http://54.163.51.119:3007', {
      method: 'POST',
      mode: 'no-cors', // Bypass CORS
      headers: { 'Content-Type': 'application/json', 'x-api-key': FUNCTOR_API_KEY },
      body: requestBody,
    })
      .then(async (response) => {
        console.log('response...:', response)
        if (!response.ok) {
          // If the response is not OK, try to read it as text
          const errorText = await response.text()
          throw new Error(`Request failed with status ${response.status}: ${errorText}`)
        }
        return response.json()
      })
      .then((data) => {
        console.log('Response data:', data)
        resolve(data)
      })
      .catch((error) => {
        console.error('Error:', error)
        reject(error)
      })
  })
}

function createSessionKey(smartAccountAddress: string) {
  return new Promise((resolve, reject) => {
    fetch('http://54.163.51.119:3007', {
      method: 'POST',
      mode: 'no-cors', // Bypass CORS
      headers: { 'Content-Type': 'application/json', 'x-api-key': FUNCTOR_API_KEY },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'functor_createSessionKey',
        params: [
          smartAccountAddress,
          [
            {
              contractAbi:
                '[{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}]',
              allowedMethods: ['transfer(address,uint256)'],
            },
          ],
          3600,
          {
            label: 'AI Agent Session Key',
            restricted: true,
          },
        ],
        id: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        resolve(data)
      })
      .catch((error) => {
        console.error('Error:', error)
        reject(error)
      })
  })
}

export { createSmartAccount, createSessionKey }
