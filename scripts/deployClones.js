// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

const hre = require('hardhat')
const {ethers, waffle} = require('hardhat')
const provider = waffle.provider
const {utils} = ethers

async function main () {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');
    
    //local
    // let exhibitionConsumerMaster = '0x74C47fCa6e13922d8a539bdb8B6D212E35676fe7'
    // let exhibitionMaster = '0x7683b68717FF30E23A545D91671E65A796e59B63'
    // let factoryAddress = '0xCb4a79d2F2D9abBAC2e46673f8c54caF45C2A505'
    
    //Rinkeby factory
    let exhibitionConsumerMaster = '0xC21CB2d4E705CC3b785223449a5D2c61590EfD45'
    let exhibitionMaster = '0xA2fb324c842cb4F40A83D0Dd28627217eCe4E16E'
    let factoryAddress = '0x60d447661ab5243E5DE99cd459D80f711c41b6A6'
    
    let owner
    let addr1
    // let controller
    
    [owner, addr1, ...addrs] = await ethers.getSigners()
    
    // controller = addr1
    
    let controller = '0x47205dE3A08b5a739e2258fc5e8B4fF9071e3bd7'
    let isArtist = true
    
    let exhibitionName = 'Logesh Factory test 1'
    let description = 'Description 1'
    let peerUri = '1'
    let graceTime = 1
    let untRateStakers = utils.parseUnits('2.833333333333330000')
    let untRateExhibitionController = utils.parseUnits(
        String(0.500000000000000000))
    let priceProviders = [1]
    let consumerVersion = 1
    
    console.log('owner', owner.address)
    console.log('controller', controller)
    
    const ExhibitionFactory = await ethers.getContractFactory(
        'ExhibitionFactory')
    const exhibitionFactory = await ExhibitionFactory.attach(factoryAddress)
    
    let uniftyFee = 1500
    let version = 1
    
    let estimatedGasLimit
    try {
        estimatedGasLimit = await exhibitionFactory.estimateGas.createExhibition(
            isArtist, owner.address,
            controller, uniftyFee, 'no_uri', version)
    } catch (e) {
        console.log('Error deploying exhibition: ', e)
        return
    }
    
    let estimatedGasPrice = await provider.getGasPrice()
    
    console.log('gasPrice', estimatedGasPrice.toString())
    console.log('gasLimit:', estimatedGasLimit.toString())
    
    let overrides = {
        gasLimit: estimatedGasLimit,
        gasPrice: estimatedGasPrice,
    }
    
    let exhibitionTx = await exhibitionFactory.createExhibition(isArtist,
        owner.address,
        controller, uniftyFee, 'no_uri', version, overrides)
    
    let exhibitionReceipt = await exhibitionTx.wait()
    console.log('exhibitionReceipt:', exhibitionReceipt.transactionHash)
    
    let ethUsed = utils.formatUnits(
        utils.parseUnits(exhibitionReceipt.gasUsed.toString(), 'gwei'),
        'ether')
    
    console.log(`ethUsed: ${ethUsed} ETH`)
    
    if (exhibitionReceipt.status) {
        
        console.log(
            `Transaction receipt : https://rinkeby.etherscan.io/tx/${exhibitionReceipt.transactionHash}`)
        
        let exhibitionIndex = await exhibitionFactory.getExhibitionsLength() - 1
        
        let exhibitionAddress = await exhibitionFactory
            .getExhibitionAddressAtIndex(exhibitionIndex)
        
        console.log('Exhibition Clone deployed to:', exhibitionAddress)
    }
    
    console.log(`=========================================`)
    
    try {
        estimatedGasLimit = await exhibitionFactory.estimateGas.createExhibitionConsumer(
            exhibitionName,
            description,
            peerUri,
            graceTime,
            untRateStakers,
            untRateExhibitionController,
            priceProviders,
            consumerVersion,
        )
    } catch (e) {
        console.log('Error deploying Consumer: ', e)
        return
    }
    
    estimatedGasPrice = await provider.getGasPrice()
    
    console.log('gasPrice', estimatedGasPrice.toString())
    console.log('gasLimit:', estimatedGasLimit.toString())
    
    overrides = {
        gasLimit: estimatedGasLimit,
        gasPrice: estimatedGasPrice,
    }
    
    let consumerTx = await exhibitionFactory.createExhibitionConsumer(
        exhibitionName,
        description,
        peerUri,
        graceTime,
        untRateStakers,
        untRateExhibitionController,
        priceProviders,
        consumerVersion,
        overrides,
    )
    
    let consumerReceipt = await consumerTx.wait()
    console.log('consumerReceipt:', consumerReceipt.transactionHash)
    ethUsed = utils.formatUnits(
        utils.parseUnits(consumerReceipt.gasUsed.toString(), 'gwei'),
        'ether')
    
    console.log(`ethUsed: ${ethUsed} ETH`)
    
    if (consumerReceipt.status) {
        
        console.log(
            `Consumer Transaction receipt : https://rinkeby.etherscan.io/tx/${consumerReceipt.transactionHash}`)
        
        let exhibitionConsumerIndex = await exhibitionFactory.getConsumersLength() -
            1
        
        let exhibitionConsumerAddress = await exhibitionFactory
            .getConsumerAddressAtIndex(exhibitionConsumerIndex)
        
        console.log('Consumer Clone deployed to:', exhibitionConsumerAddress)
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
