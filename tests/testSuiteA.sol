pragma solidity ^0.8.7;

import "./ERC721.sol";
import "./ERC1155.sol";
import "../exhibition.sol";

contract TestSuiteA {

    Exhibition e;
    ERC721PresetMinterPauserAutoId erc721;
    ERC1155PresetMinterPauser erc1155;

    constructor(){

        /**
         * TEST SUITE BOOTSTRAPPING
         * 
         * */

        e = new Exhibition();
        erc721 = new ERC721PresetMinterPauserAutoId("Test ERC721", "TEST", "");
        erc1155 = new ERC1155PresetMinterPauser("");

        /**
         * TEST SUITE EXECUTION BEGIN
         * 
         * */

        // must  mint tokenIds 0 to 2
        test_mintERC721Next(0);
        test_mintERC721Next(1);
        test_mintERC721Next(2);
        test_mintERC1155Next(0, 100);

        // must add the previously minted tokens to the exhibition
        test_addToExhibition(address(erc721), 0, 0, 1, 100, 1, 1);

        // adding 2 times the same erc1155, supply must increase
        test_addToExhibition(address(erc1155), 0, 1, 50, 100, 1, 50);
        test_addToExhibition(address(erc1155), 0, 1, 50, 100, 1, 100);

        test_addToExhibition(address(erc721), 1, 0, 1, 200, 1, 1);
        test_addToExhibition(address(erc721), 2, 0, 1, 300, 1, 1);

        // must return the tokens to this address
        test_removeFromExhibition(address(erc721), 0, 1, address(this), 0);
        test_removeFromExhibition(address(erc721), 1, 1, address(this), 0);
        test_removeFromExhibition(address(erc721), 2, 1, address(this), 0);
        test_removeFromExhibition(address(erc1155), 0, 100, address(this), 0);

        // must delete the cards

        test_deleteCard(0, 4, 3);
        test_deleteCard(2, 3, 2);
        test_deleteCard(1, 2, 1);
        test_deleteCard(0, 1, 0);

        // must throw an error
        // test_deleteCard(0, 0, 0);

    }

    /**
     * Must delete a card and check for the correct cards length.
     * */
    function test_deleteCard(uint256 _index, uint256 _expectedInitialAmount, uint256 _expectedEndingAmount) internal{

        require(e.getCardsLength() == _expectedInitialAmount, "test_deleteCard: could not delete card. initial amount wrong.");

        e.deleteCard(_index);

        require(e.getCardsLength() == _expectedEndingAmount, "test_deleteCard: could not delete card.");
    }

    /**
     * Must remove the expected token from the exhibition and send it to the expected address in the expected supply
     * */
    function test_removeFromExhibition(address _tokenAddress, uint256 _tokenId, uint256 _amount, address _recipient, uint256 _expectedSupply) internal{

        Exhibition.Card memory card = e.getCard(_tokenAddress, _tokenId);

        if(card.tokenType == 0){

            require(erc721.ownerOf(_tokenId) == address(e), "test_removeFromExhibition: exhibition not the owner 721");

            e.remove(_tokenAddress, _tokenId, _amount, _recipient);

            card = e.getCard(_tokenAddress, _tokenId);

            require(card.supply == _expectedSupply, "test_removeFromExhibition: invalid supply 721.");
            require(erc721.ownerOf(_tokenId) == address(this), "test_removeFromExhibition: not the owner 721.");

        }else{

            uint256 prevOwned = erc1155.balanceOf(address(this), _tokenId);
            require(erc1155.balanceOf(address(e), _tokenId) >= _amount, "test_removeFromExhibition: exhibition not the owner 1155");

            e.remove(_tokenAddress, _tokenId, _amount, _recipient);

            card = e.getCard(_tokenAddress, _tokenId);

            require(card.supply == _expectedSupply, "test_removeFromExhibition: invalid supply 1155.");
            require(erc1155.balanceOf(address(this), _tokenId) == prevOwned + _amount, "test_removeFromExhibition: not the owner 1155.");
        }
    }

    /**
     * Must add the given token to the exhibition and confirm that supply and tokenAddress are correct.
     * 
     * */
    function test_addToExhibition(address _tokenAddress, uint256 _tokenId, uint8 _tokenType, uint256 _amount, uint256 _price, uint256 _releaseTime, uint256 _expectedSupply) internal{

        if(_tokenType == 0){
            erc721.setApprovalForAll(address(e), true);
        }else{
            erc1155.setApprovalForAll(address(e), true);
        }

        uint256 tokenId = e.add(
            _tokenAddress,
            _tokenId,
            _tokenType,
            _amount,
            _price,
            _releaseTime
        );

        require(tokenId == _tokenId, "test_addToExhibition: different tokenId returned than added.");

        Exhibition.Card memory card = e.getCard(_tokenAddress, _tokenId);

        require(card.tokenAddress == _tokenAddress, "test_addToExhibition: invalid token address.");
        require(card.supply == _expectedSupply, "test_addToExhibition: invalid supply.");
    }

    /**
     * Must mint with expected _id
     * */
    function test_mintERC1155Next(uint256 _expectedId, uint256 _amount) internal{

        erc1155.mint(address(this), _expectedId, _amount, "");

        require(erc1155.balanceOf(address(this), _expectedId) == _amount, "test_mintER1155Next: tokens not minted.");
    }

    function test_mintERC721Next(uint256 _expectedId) internal{

        erc721.mint(address(this));

        require(erc721.ownerOf(_expectedId) == address(this), "test_mintERC721Next: token not minted.");
    }
}