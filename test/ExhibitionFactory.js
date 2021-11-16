const { assert, expect } = require("chai");
const { artifacts, contract } = require("hardhat");

const ExhibitionConsumer = artifacts.require("ExhibitionConsumer");
const Exhibition = artifacts.require("Exhibition");
const ExhibitionFactory = artifacts.require("ExhibitionFactory");

contract("ExhibitionFactory", (accounts) => {

    /* 
    Creates a fresh instance of the master contracts and the factory before each test.
    */
    beforeEach(async function() {
        implementationConsumer = await ExhibitionConsumer.new();
        implementationExhibition = await Exhibition.new();
        exhibitionFactory = await ExhibitionFactory.new(implementationConsumer.address, implementationExhibition.address);
    })

    
    /* 
    Checks that the master contracts are properly set in the factory.
    */
    it("Should return master contracts' addresses", async function() {
        const consumerAddr = await exhibitionFactory.masterConsumer.call();
        assert.equal(consumerAddr, implementationConsumer.address);

        const exhibitionAddr = await exhibitionFactory.masterExhibition.call();
        assert.equal(exhibitionAddr, implementationExhibition.address);
    })

    /* 
    Checks that whitelist admin functionality works correctly by trying (and failing) to create clones from a non-whitelist address.
    */
    it("Should fail to create clone for non-whitelist admin", async function() {
        await expect(
            exhibitionFactory
            .createExhibitionConsumer("Test 1", "test 1 desc", "", 1, "1000000000000000000", "1000000000000000000", [0], 1, {from: accounts[1]}))
            .to.be.revertedWith("WhitelistAdminRole: caller does not have the WhitelistAdmin role");

        await expect(
            exhibitionFactory
            .createExhibition(true, accounts[0], accounts[1], 1500, "",1, {from: accounts[1]}))
            .to.be.revertedWith("WhitelistAdminRole: caller does not have the WhitelistAdmin role")
    })

    /* 
    - Creates two consumer clones
    - Checks that their values are set correctly on initialization
    - Checks that the created clones are correctly stored in the factory 
    */
    it("Should deploy two new exhibition consumers", async function() {
        //Deploying first consumer
        const receipt = await exhibitionFactory.createExhibitionConsumer("Test 1", "test 1 desc", "", 1, "1000000000000000000", "1000000000000000000", [0], 1);
        const consumerAddr = receipt.logs[0].args.consumer;
        const consumerAdded = await exhibitionFactory.getConsumerAddressAtIndex(0);

        assert.equal(consumerAddr, consumerAdded);

        const consumer = await ExhibitionConsumer.at(consumerAddr);
        const name = await consumer.name.call();
        const desc = await consumer.description.call();

        assert.equal(name, "Test 1");
        assert.equal(desc, "test 1 desc");

        //Deploying second consumer
        const receipt2 = await exhibitionFactory.createExhibitionConsumer("Test 2", "test 2", "", 1, "1000000000000000000", "1000000000000000000", [0], 1);
        const consumerAddr2 = receipt2.logs[0].args.consumer;
        const consumerAdded2 = await exhibitionFactory.getConsumerAddressAtIndex(1);
        assert.equal(consumerAddr2, consumerAdded2);
        assert.notEqual(consumerAddr, consumerAddr2);
        
        const consumer2 = await ExhibitionConsumer.at(consumerAddr2);
        const name2 = await consumer2.name.call();
        const desc2 = await consumer2.description.call();
        assert.equal(name2, "Test 2");
        assert.equal(desc2, "test 2");
    })

    /* 
    - Creates two exhibition clones
    - Checks that values are correctly set on initialization
    - Checks that created clones are correctly stored in the factory
    - Checks that whitelist admin functionality works correctly
    */
    it("Should deploy two new exhibitions", async function() {
        /* Deploying first exhibition */
        const receipt = await exhibitionFactory.createExhibition(true, accounts[0], accounts[1], 1500, "", 1);

        const exhibitionAddr = receipt.logs[1].args.exhibition;
        const exhibitionAdded = await exhibitionFactory.getExhibitionAddressAtIndex(0);

        const exhibition = await Exhibition.at(exhibitionAddr);
        const isArtist = await exhibition.isArtistExhibition.call();
        const controller = await exhibition.controller.call();

        assert.equal(isArtist, true); // Checks that is artist is set
        
        assert.equal(exhibitionAddr, exhibitionAdded); // Checks that address is correct
        
        assert.equal(controller, accounts[1]); //Checks that controller is set

        const isControllerWhitelistAdmin = await exhibition.isWhitelistAdmin(controller);

        assert.isTrue(isControllerWhitelistAdmin); //Checks that controller is also whitelist admin


        /* Deploying second exhibition */
        const receipt2 = await exhibitionFactory.createExhibition(false, accounts[0], accounts[2], 1500, "", 1);

        const exhibitionAddr2 = receipt2.logs[1].args.exhibition;
        const exhibitionAdded2 = await exhibitionFactory.getExhibitionAddressAtIndex(1);

        assert.equal(exhibitionAddr2, exhibitionAdded2);
        assert.notEqual(exhibitionAddr, exhibitionAddr2);

        const exhibition2 = await Exhibition.at(exhibitionAddr2);
        const isArtist2 = await exhibition2.isArtistExhibition.call();
        const controller2 = await exhibition2.controller.call();

        assert.equal(isArtist2, false); //Checks that is artist is set

        assert.notEqual(isArtist, isArtist2); //Checks that is artist is different from other exhibition value

        assert.equal(exhibitionAddr2, exhibitionAdded2); //Checks that address is correct

        assert.equal(controller2, accounts[2]); //Checks that controller is set

        const isControllerWhitelistAdmin2 = await exhibition2.isWhitelistAdmin(controller2);

        assert.isTrue(isControllerWhitelistAdmin2); //Checks that controller is also whitelist admin

        assert.notEqual(controller2, controller); //Checks that the two controllers are different for exhibitions
    })

    /* 
    - Creates a new consumer clone
    - Checks that state modifying functions work
    */
    it("Should deploy a consumer and change its name & description", async function() {
       //Deploying first consumer
       const receipt = await exhibitionFactory.createExhibitionConsumer("Test 1", "test 1 desc", "", 1, "1000000000000000000", "1000000000000000000", [0], 1);

       const consumerAddr = receipt.logs[0].args.consumer;
       const consumer = await ExhibitionConsumer.at(consumerAddr);
       
        const name = await consumer.name.call();
        const desc = await consumer.description.call();

        await consumer.setNameAndDescription("Test 11", "test 11")

        const name2 = await consumer.name.call();
        const desc2 = await consumer.description.call();

        assert.notEqual(name, name2)
        assert.notEqual(desc, desc2)
    })
})