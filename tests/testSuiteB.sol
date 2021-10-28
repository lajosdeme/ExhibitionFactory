pragma solidity ^0.8.7;

import "./ERC721.sol";
import "./ERC1155.sol";
import "../exhibition.sol";

contract TestSuiteB {

    Exhibition e;
    ERC721PresetMinterPauserAutoId erc721;
    ERC1155PresetMinterPauser erc1155;

    bytes4 constant internal ERC1155_RECEIVED_VALUE = 0xf23a6e61;
    bytes4 constant internal ERC721_RECEIVED = 0x150b7a02;
    bytes4 constant internal RECEIVED_ERR_VALUE = 0x0;

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
        test_mintERC1155Next(0, 100);

        // must add the previously minted tokens to the exhibition
        test_addToExhibition(address(erc721), 0, 0, 1, 100, 1, 1);
        test_addToExhibition(address(erc1155), 0, 1, 10, 100, 1, 10);
    }

    /**
     * Needed to receive funds to test with delayedTest_buy()
     * */
    receive() external payable{}

    /**
     * This test should be called separately from the suite and the expected eth being sent alongside
     * 
     * To test this, send min. 100 wei to this contract, then execute.
     * 
     * */
    function delayedTest_buy721() external {

        e.buy{value: 100}(address(erc721), 0, 1);

        require(erc721.ownerOf(0) == address(this), "delayedTest_buy721: purchase not successful.");
    }

    /**
     * This test should be called separately from the suite and the expected eth being sent alongside
     * 
     * To test this, send min. 1000 wei to this contract, then execute.
     * 
     * */
    function delayedTest_buy1155() external {

        uint256 prevOnwed = erc1155.balanceOf(address(this), 0);

        e.buy{value: 1000}(address(erc1155), 0, 10);

        require(erc1155.balanceOf(address(this), 0) == prevOnwed + 10, "delayedTest_buy1155: purchase not successful.");
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

    function onERC1155Received(address _operator, address _from, uint256 _id, uint256 _amount, bytes calldata _data) external view returns(bytes4){

        return ERC1155_RECEIVED_VALUE;
    }

    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external view returns (bytes4){

        return ERC721_RECEIVED;
    }
}