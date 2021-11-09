// SPDX-License-Identifier: Not specified
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./ExhibitionConsumer.sol";
import "./exhibition.sol";
import "./utils/WhitelistAdminRole.sol";

contract ExhibitionFactory is WhitelistAdminRole {
    ExhibitionConsumer[] public consumers;
    Exhibition[] public exhibitions;
    address public masterConsumer;
    address public masterExhibition;

    event ConsumerCloneCreated(address consumer);
    event ExhibitionCloneCreated(address exhibition);

    /**
    * Exhibition Factory according to EIP 1167.
    * The master contracts are set in the constructor.
    */ 
    constructor(address _masterConsumer, address _masterExhibition) {
        require(_masterConsumer != address(0), "Master consumer has to be a valid address.");
        require(_masterExhibition != address(0), "Master exhibition has to be a valid address.");
        
        masterConsumer = _masterConsumer;
        masterExhibition = _masterExhibition;
    }

    /** 
    * - Creates a clone of the master consumer
    * - Calls the initializer
    * - Emits consumer created event
    * - Pushes the new consumer onto the consumers array
    * - Returns the address of the new consumer 
    */ 
    function createExhibitionConsumer(
        string memory _name,
        string memory _description,
        string memory _peerUri,
        uint256 _graceTime,
        uint256 _untRateStakers,
        uint256 _untRateExhibitionController,
        uint256[] memory _priceProviders
    ) external onlyWhitelistAdmin returns (address) {

        ExhibitionConsumer _consumer = ExhibitionConsumer(Clones.clone(masterConsumer));

        _consumer.initialize(_name, _description, _peerUri, _graceTime, _untRateStakers, _untRateExhibitionController, _priceProviders, msg.sender);
        
        emit ConsumerCloneCreated(address(_consumer));
        consumers.push(_consumer);

        return address(_consumer);
    }

    /** 
    * - Creates a clone of the master exhibition
    * - Calls the initializer
    * - Emits the created event
    * - Sets the controller in the exhibition
    * - Adds the controller as whitelist admin
    * - Pushes the new exhibition onto the exhibitions array
    * - Returns the address of the new exhibition 
    */
    function createExhibition(
        bool _isArtistExhibition,
        address _controller
    ) external onlyWhitelistAdmin returns (address exhibition) {

        Exhibition _exhibition = Exhibition(Clones.clone(masterExhibition));

        _exhibition.initialize(_isArtistExhibition, msg.sender);

        emit ExhibitionCloneCreated(address(_exhibition));
        
        _exhibition.setController(_controller);
        _exhibition.addWhitelistAdmin(_controller);

        exhibitions.push(_exhibition);

        return address(_exhibition);
    }

    function getConsumerAddressAtIndex(uint256 _index) external view returns (address) {
        return address(consumers[_index]);
    }

    function getExhibitionAddressAtIndex(uint256 _index) external view returns (address) {
        return address(exhibitions[_index]);
    }
}
