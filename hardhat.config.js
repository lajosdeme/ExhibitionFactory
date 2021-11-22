require('dotenv').config()

require('@nomiclabs/hardhat-waffle')
require('hardhat-contract-sizer')
require('@nomiclabs/hardhat-truffle5')
require('hardhat-gas-reporter')

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()
    
    for (const account of accounts) {
        console.log(account.address)
    }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        version: '0.8.9',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        local: {
            url: process.env.LOCAL_URL || 'http://0.0.0.0:7545',
            accounts:
                process.env.LOCAL_PRIVATE_KEY !== undefined
                    ? [
                        process.env.LOCAL_PRIVATE_KEY,
                        process.env.LOCAL_PRIVATE_KEY_2,
                    ]
                    : [],
        },
        ropsten: {
            url: process.env.ROPSTEN_URL || '',
            accounts:
                process.env.PRIVATE_KEY !== undefined
                    ? [
                        process.env.PRIVATE_KEY,
                        process.env.PRIVATE_KEY_2,
                    ]
                    : [],
        },
        rinkeby: {
            url: process.env.RINKEBY_URL || '',
            accounts:
                process.env.PRIVATE_KEY !== undefined
                    ? [
                        process.env.PRIVATE_KEY,
                        process.env.PRIVATE_KEY_2,
                    ]
                    : [],
        },
    },
    contractSizer: {
        alphaSort: false,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: false,
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: 'USD',
    },
}
