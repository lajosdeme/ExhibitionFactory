const {assert, expect} = require("chai");
const { artifacts, contract } = require("hardhat");

const Exhibition = artifacts.require("Exhibition");
const ERC1155 = artifacts.require("ERC1155PresetMinterPauser");

contract("Exhibition", (accounts) => {
    beforeEach(async function() {
        exhibition = await Exhibition.new();
        erc1155 = await ERC1155.new("");
        //mint 10 erc1155
        await erc1155.mint(accounts[0], 0, 10, []); 
        const balance = await erc1155.balanceOf(accounts[0], 0);
        assert.equal(balance.toString(), "10");
    })

    it("Should add a new card that is not tradable", async function() {
        //Set approval to add NFT
        await erc1155.setApprovalForAll(exhibition.address, true);
        //add NFT
        await exhibition.add(erc1155.address, 0, 1, 5, 100, 1, false);
        
        const newCard = await exhibition.getCardByIndex(0);
        assert.isFalse(newCard.tradable);
    })
    
    it("Should try to buy card that is not tradable", async function() {
        //Set approval to add NFT
        await erc1155.setApprovalForAll(exhibition.address, true);
        //add NFT
        await exhibition.add(erc1155.address, 0, 1, 5, 100, 1, false);

        await expect(exhibition.buy(erc1155.address, 0, 1, {from: accounts[0], value: 100})).to.be.revertedWith("Not tradable.")
    })

    it("Should buy a card that is tradable", async function() {
        //Set approval to add NFT
        await erc1155.setApprovalForAll(exhibition.address, true);
        //add NFT
        await exhibition.add(erc1155.address, 0, 1, 5, 100, 1, true);

        await exhibition.buy(erc1155.address, 0, 1, {from: accounts[0], value: 100})

        const card = await exhibition.getCardByIndex(0);
        assert.equal(card.supply, 4);
    })

    it("Should update a card from tradable to not tradable", async function() {
        //Set approval to add NFT
        await erc1155.setApprovalForAll(exhibition.address, true);
        //add NFT
        await exhibition.add(erc1155.address, 0, 1, 5, 100, 1, true);
        const cardOld = await exhibition.getCardByIndex(0);
        const tradableOld = cardOld.tradable;

        await exhibition.update(erc1155.address, 0, 100, 1, false);
        const card = await exhibition.getCardByIndex(0);
        const tradable = await card.tradable;

        assert.isFalse(tradable);
        assert.notEqual(tradableOld, tradable);
    })
})
