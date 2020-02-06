/* 2018 - 10 - 30 samrt contract */
pragma solidity ^0.4.11;

// @title BPrintAccessControl for Access control
// BPrint는 학교 내부에서 사용될 것이므로
// (1명 이상의) 관리자를 통해 접근제어를 시행한다.
contract BPrintAccessControl {
    //@dev smart contrct트 변화시 새로운 smart contract 주소 저장
    address adminAddress;
    event ContractUpgrade(address newContract);

    bool public paused; // BPrint contract의 가동 여부 확인 변수

    //@dev CEO만 함수를 호출할 수 있도록 접근제어자 
    modifier onlyAdmin() {
        require(msg.sender == adminAddress);
        _;
    }

    //@dev BPrint contract 정지 여부 확인
    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    //@dev BPrint contract 정지 여부 확인
    modifier whenPaused {
        require(paused);
        _;
    }

    //@dev CEO 설정 
    //@param _newCEO CEO로 설정할 계정의 address 
    function setAdmin(address _newAdmin) external onlyAdmin returns(bool succ){
        if(_newAdmin == address(0))
            return false;
        adminAddress = _newAdmin;
        return true;
    }

    //@dev BPrint에 이상이 발생 시 중단시키기 위해 사용
    function pause() external onlyAdmin whenNotPaused {
        paused = true;
    }

    //@dev BPrint를 재가동하기 위해 사용
    function unpause() public onlyAdmin whenPaused {
        paused = false;
    }
}
/*
 2018 - 10 - 06 samrt contract
*/
pragma solidity ^0.4.16;


// @title AimeiBase 
contract BprintiBase is BPrintAccessControl{
    //@dev token의 이동이 발생하면 from , to, tokens를 block chain에 기록
    event Transfer(address indexed from, address indexed to, uint tokens);
    //@dev tokenOwner에게 관리자가 token의 사용 허락을 block chain에 기록
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
    
    //@dev 사용자 address와 잔액 
    mapping (address => uint256) public balance;
    //@dev 사용자 address와 다른 사용자 address와 허가 액수 
    mapping (address => mapping (address => uint256)) allowed;
    //@dev 사용자 address와 Transaction
    mapping (address => uint256) public history_num;
    //@dev 전체 사용자의 history 개수와 history 구조체
    mapping (address => mapping (uint => Transaction_history)) public MyHistory;

    //@dev Aimei 내에서 발생한 중요 transaction들을 기록
    struct Transaction_history{        
        address token_from;     //transaction에서 토큰을 주는 address     
        address token_to;       //transaction에서 토큰을 받은 address       
        uint token_value;       //transaction에서 발생한 토큰의 양      
        string token_why;       //transaction이 발생한 이유
    }


    //@dev from에서 to로 token의 전달을 실질적으로 수행하는 함수
    // transfer 성공시 true 실패시 false 반환
	//@param _to ; 토큰을 받을 사용자 account
	//@param -tokens : 전달할 토큰의 양
    function _transfer(address _to, uint256 _tokens) internal  onlyAdmin returns (bool success){
        if(msg.sender == address(0) || _to == address(0) || _to == address(this))
            return false;
        require(balance[msg.sender] >= _tokens);
        require(balance[_to] + _tokens > balance[_to]);
        balance[msg.sender] -= _tokens;                   // Subtract from the sender
        balance[_to] += _tokens;                           // Add the same to the recipient  
        history_num[_to]++;
        MyHistory[_to][history_num[_to]].token_from = msg.sender;
        MyHistory[_to][history_num[_to]].token_to = _to;
        MyHistory[_to][history_num[_to]].token_value = _tokens;

        //Transfer(msg.sender, _to, _tokens);
        return true;
    }

    //@dev from에서 to로 token의 전달을 실질적으로 수행하는 함수
    // transfer 성공시 true 실패시 false 반환
	//@param _from : 토큰을 전달할 사용자 account
    //@param _to 토큰을 받을 사용자 account
	//@param _tokens 전달할 토큰의 양
    function _transferFrom(address _from, address _to, uint256 _tokens) internal returns (bool success) {
        if(_from == address(0) || _to == address(0))
            return false;
        require(balance[_from] >= _tokens);
        require(balance[_to] + _tokens > balance[_to]);
        balance[_from] -= _tokens;      // sender에 토큰 보낸 만큼 차감
        balance[_to] += _tokens;        // recipient에 토큰 같은 양 증가 

        history_num[_to]++;
        MyHistory[_to][history_num[_to]].token_from = _from;
        MyHistory[_to][history_num[_to]].token_to = _to;
        MyHistory[_to][history_num[_to]].token_value = _tokens;
    
        //Transfer(_from, _to, _tokens);
        return true;
    }

    //@dev :　to 사용자에게 token의 사용을 허락하는 함수
    //approve 성공시 true 실패시 false 반환
	//@param _to ; 토큰을 사용을 허락 받는 사용자 account
	//@param _tokens : 전달할 토큰의 양
    function _approve(address _to, uint256 tokens) internal returns (bool success) {
        if(_to == address(0))
            return false;

        allowed[msg.sender][_to] = tokens;
        emit Approval(msg.sender, _to, tokens);
        return true;
    }

}

// ----------------------------------------------------------------------------
// ERC Token Standard #20 Interface
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
// ----------------------------------------------------------------------------
contract ERC20Interface{
    // Required methods
    function totalSupply() public constant returns (uint);
    function balanceOf(address tokenOwner) public constant returns (uint balance);
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);
    
    // Events
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}


// @title AimeiToken 

contract BPrintToken is BprintiBase, ERC20Interface{

    string public name;             // AimeiToken의 이름
    string public symbol;           // AimeiToken의 단위(ex ￥,$ )
    uint256 public totoalSupply;    // AimeiToken의 현재 발행된 토큰의 양
    uint8 public decimals;          // AimeiToken을 표현 할 때 소수점 아래의 자리 수 10^18 wei = 1 ether 이므로 통상적으로 18로 한다,

    //@dev AimeiToken의 이동이 발생하면 from , to, tokens를 block chain에 기록
    event Transfer(address indexed from, address indexed to, uint tokens);
    //@dev tokenOwner에게 관리자가 AimeiToken의 사용 허락을 block chain에 기록
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
    //@dev 관리자에게 AimeiToken의 추가를 block chain에 기록
    event AddTotalsupply(uint totaltokens ,uint addtokens);
    //@dev 관리자에게 AimeiToken의 파괴를 block chain에 기록
    event DelTotalsupply(uint totaltokens ,uint deltokens);

    //@dev Aimei Block Chain을 시작하며 Token 생성
	//@param _tokenName :  AimeiToken의 이름
	//@param _tokenSymbol : AimeiToken의 단위(ex ￥,$ )
	//@param _decimalUnits : AimeiToken을 표현 할 때 소수점 아래의 자리 수
	//@param _initialSupply : 초기에 관리자에게 주어지는 AimeiToken의 개수
    function initialize_AimeiToken(string _tokenName,string _tokenSymbol,uint8 _decimalUnits,uint256 _initialSupply) internal onlyAdmin
    {
        name = _tokenName;
        symbol = _tokenSymbol;
        decimals = _decimalUnits;
        balance[msg.sender] = _initialSupply;          
        totoalSupply = _initialSupply;
    }
    
    //@dev 현재 발급된 토큰의 개수를 반환 
    function totalSupply() constant public whenNotPaused onlyAdmin returns(uint256 Supply){
        return totoalSupply;
    }
    //@dev 사용자의 Account의 Token의 개수를 반환
    function balanceOf(address tokenOwner) public constant whenNotPaused returns (uint256 val) {
        return balance[tokenOwner];
    }

    //@dev 관리자가 _to 사용자에게 Token의 전달을 수행
    //@param _to : Token을 받으려고 하는 사용자
	//@param _tokens : 받을 Token의 양
    function transfer(address _to, uint _tokens) public whenNotPaused onlyAdmin returns (bool success)
    { 
        if(_transfer(_to, _tokens))
            return true;
        else 
            return false;
    }

    //@dev from에서 _to 사용자에게 Token의 전달을 수행
	//@param _from : Token을 주려고 하는 사용자
	//@param _to : Token을 받으려고 하는 사용자
	//@param _tokens : 받을 Token의 양
    function transferFrom(address _from, address _to, uint256 _tokens) public whenNotPaused returns(bool success) 
    {  
        if(!(_transferFrom(_from,_to,_tokens)))
            return false;
        else
            return true;
    }

    //@dev to 사용자에게 token의 사용을 허락하는 함수
	//@param _to ; 토큰을 사용을 허락 받는 사용자 account
	//@param _tokens : 전달할 토큰의 양
    function approve(address _to, uint256 tokens) public  whenNotPaused returns (bool success) {
        _approve(_to, tokens);
        return true;
    }

    //@dev to 사용자에게 token의 사용을 허락하는 함수
	//@param _to ; 토큰을 사용을 허락 받는 사용자 account
	//@param _tokens : 전달할 토큰의 양
    function allowance(address _owner, address _spender) constant public whenNotPaused returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }
    

    //@dev 관리자의 Token을 파괴
	//@param _addSupply 추가할 Token의 개수
    function add(uint256 _addSupply) public onlyAdmin whenNotPaused returns(bool){
        if(totoalSupply > totoalSupply + _addSupply)
            return false;        

        totoalSupply += _addSupply;
        balance[msg.sender] += _addSupply;
       emit AddTotalsupply(totoalSupply,_addSupply);
        return true;
    }    

    //@dev 관리자의 Token을 파괴
	//@param _delSupply 삭제할 Token의 개수
    function del(uint256 _delSupply) public onlyAdmin whenNotPaused returns(bool){
        if(totoalSupply < totoalSupply - _delSupply)
            return false;       

        totoalSupply -= _delSupply;
        balance[msg.sender] -= _delSupply;
        emit DelTotalsupply(totoalSupply,_delSupply);
        return true;
    }    
}

//@repairman , Buyer , Seller , Printer
contract BPrintRegister is BPrintToken{


    //@dev BPrint에 등록되어 있는 프린터의 device 고유 번호
    mapping (uint256 => dev) public Device;
    //@dev BPrint에 등록되어 있는 ink, paper 판매자
    mapping (address => bool) public Buyer;
    //@dev BPrint에 등록되어 있는 ink, paper 판매자
    mapping (address => bool) public Seller;
    //@dev BPrint에 등록되어 있는 프린터 수리자
    mapping (address => bool) public Repairman;

    //@dev order_num 과 주소와 상태 매핑
    mapping (uint => order) public Paper_Order;
    //@dev 
    mapping (uint => order) public Toner_Order;
    //@dev 
    mapping (uint => order) public Repair_Order;

    mapping(uint256 => uint256) public IndexDevice;
    struct num_register{
        uint32 device_num;  //현재 contract내의 device(printer)개수
        uint32 seller_num;  //현재 contract내의
        uint32 repairman_num;
        uint32 buyer_num;
        uint32 toner_num;
        uint32 paper_num;
        uint32 repair_num;
    }

    struct dev{
        string location;
        uint256 dev_num;
    }
    struct order{
        address sender; 
        address recept;         //order가 되었을 때 수락한 계정 주소
        uint80 num;
        uint80 price;
        uint80 order_num;
        bool end;               //해당 주문서가 완료(판매자의 판매 완료)된 주문서인지 확인
    }
    
    
    num_register register;


    function num_paper() constant public whenNotPaused returns (uint32 num) {
        return register.paper_num;
    }
    
    function num_toner() constant public whenNotPaused returns (uint32 num) {
        return register.toner_num;
    }
    function num_repair() constant public whenNotPaused returns (uint32 num) {
        return register.repair_num;
    }
    
    function num_device() constant public whenNotPaused returns (uint32 num) {
        return register.device_num;
    }

    //@dev 판매자 계정을 Bprint에 추가
	//@param _buyer 추가할 판매자 계정의 address
    function add_buyer(address _buyer) public{
        register.buyer_num++;
        Seller[_buyer] = true;
    }

    //@dev 판매자 계정을 Bprint에서 삭제
	//@param _seller 삭제할 판매자 계정의 address
    function del_buyer(address _buyer) public{
        Seller[_buyer] = false;
        register.buyer_num--;
    }

    //@dev 판매자 계정을 Bprint에 추가
	//@param _seller 추가할 판매자 계정의 address
    function add_seller(address _seller) public{
        register.seller_num++;
        Seller[_seller] = true;
    }

    //@dev 판매자 계정을 Bprint에서 삭제
	//@param _seller 삭제할 판매자 계정의 address
    function del_seller(address _seller) public{
        Seller[_seller] = false;
        register.seller_num--;
    }

    //@dev 프린터 수리업체 계정을 Bprint에 등록
	//@param _repairman 추가할 수리업체 계정의 address
    function add_repairman(address _repairman) public{
        register.repairman_num++;
        Repairman[_repairman] = true;
    }

    //@dev 프린터 수리업체 계정을 Bprint에서 삭제
	//@param _repairman 삭제할 수리업체 계정의 address
    function del_repairman(address _repairman) public{
        register.repairman_num--;
        Repairman[_repairman] = false;
    }


    function index_device(uint80 _device) public view returns(uint index)
    {
        return IndexDevice[_device];
    }


    //@dev  프린터 장치 번호를 Bprint에 추가
	//@param _device 프린터의 device 번호 
    function add_device(uint256 _device,string _location) public{
        Device[register.device_num].dev_num = _device;
        Device[register.device_num].location = _location;
        IndexDevice[_device] = register.device_num;
        register.device_num++;
    }

    //@dev  
	//@param _device 프린터의 device 번호
    function del_device(uint256 _device) public{
        Device[register.device_num].dev_num = 0;
        Device[register.device_num].location = "";
        IndexDevice[_device] = 0;
        register.device_num--;
    }
}


//@title BPrintSeller
//ink order
//paper order
//token 구매
contract BPrintCore is BPrintRegister{

    mapping(uint80 => uint256) public IndexPaper;
    mapping(uint80 => uint256) public IndexToner;
    mapping(uint80 => uint256) public IndexRepair;

    constructor(string token_name,string symbol, uint8 digit, uint256 supply) public{          
        paused = false;                 // 초기 paused 값 설정
        adminAddress = msg.sender;
        //토큰을 생성하며 Aimei BlockChain 초기화
        initialize_AimeiToken(token_name,symbol,digit,supply);
    }

    function index_paper(uint80 _order_num) public view returns(uint index)
    {
        return IndexPaper[_order_num];
    }

    function index_toner(uint80 _order_num) public view returns(uint index)
    {
        return IndexToner[_order_num];
    }

    function index_repair(uint80 _order_num) public view returns(uint index)
    {
        return IndexRepair[_order_num];
    }

    function order_toner(address _sender, uint80 _order_num) public returns(bool suceess){
        require(transferFrom(_sender, adminAddress ,50 * 2));
            
        Toner_Order[register.toner_num].sender = _sender;
        Toner_Order[register.toner_num].recept = 0;
        Toner_Order[register.toner_num].num = 50;
        Toner_Order[register.toner_num].price = 50 * 2;
        Toner_Order[register.toner_num].order_num = _order_num;
        Toner_Order[register.toner_num].end = false;      
        IndexToner[_order_num] = register.toner_num;
        register.toner_num++;
        return true;  
    }

    function order_paper(address _sender, uint80 _order_num) public returns(bool suceess){
        require(transferFrom(_sender, adminAddress ,50 *3));
         
        Paper_Order[register.paper_num].recept = _sender;
        Paper_Order[register.paper_num].recept = 0;
        Paper_Order[register.paper_num].num = 50;
        Paper_Order[register.paper_num].price = 50 * 3;
        Paper_Order[register.paper_num].order_num = _order_num;
        Paper_Order[register.paper_num].end = false;
        IndexPaper[_order_num] = register.paper_num;
        register.paper_num++;
        return true;  
    }

    
    //고장 요청
    function order_repair(address _sender, uint80 _order_num) public returns(bool suceess){
        require(transferFrom(_sender, adminAddress ,30));
    
        Repair_Order[register.repair_num].sender = _sender;
        Repair_Order[register.repair_num].recept = 0;
        Repair_Order[register.repair_num].price = 30;
        Repair_Order[register.repair_num].order_num = _order_num;
        Repair_Order[register.repair_num].end = false;
        IndexRepair[_order_num] = register.repair_num;
        register.repair_num++;
        return true;
    }

    //@dev 
	//@param 
	//@param 
    function accept_toner(uint _i,address _seller) public returns (bool suceess){   
        Toner_Order[_i].recept = _seller; 
        Toner_Order[_i].end = true;     
        if(transfer(_seller, Toner_Order[_i].price))
            return true;
        else{
            Toner_Order[_i].recept = 0; 
            Toner_Order[_i].end = false;
            return false;
        }
    }

    //@dev 
	//@param 
	//@param 
    function accept_paper(uint _i, address _seller) public returns (bool suceess){

        Paper_Order[_i].recept = _seller;           
        Paper_Order[_i].end = true;
        if(transfer(_seller, Paper_Order[_i].price))
            return true;
        else{
            Paper_Order[_i].recept = 0;           
            Paper_Order[_i].end = false;
            return false;
        }
    }

    //수리 완료
    function clear_repair(uint _i, address _repairman) public returns (bool suceess){   
        Repair_Order[_i].recept = _repairman; 
        Repair_Order[_i].end = true;     
        if(transfer(_repairman, Repair_Order[_i].price))
            return true;
        else{
            Repair_Order[_i].recept = 0;           
            Repair_Order[_i].end = false;
            return false;
        }
    }

    //@dev 
	//@param 
	//@param 
    function buy_token(uint _tokens, uint _per) public payable returns(bool success){
        //이더 사용자 -> 관리자
        //토큰 관리자 -> 사용자
        uint total;
        require(balanceOf(msg.sender) + _tokens > balanceOf(msg.sender)); //overflow 확인
        if(transferFrom(adminAddress,msg.sender,_tokens)) //관리자에게 토큰 전달
        {
            total = _tokens*_per;
            adminAddress.transfer(total); //돈 받기
            return true;
        }

        return false;
    }
 
    function buy_user_token(address _user,uint _tokens,uint _per) public onlyAdmin payable returns(bool success){
        //require meg.sender == _my
        require(balanceOf(_user) >= _tokens);
        if(transferFrom(_user, msg.sender,_tokens)) //관리자에게 토큰 전달
        {
            _user.transfer(_tokens*_per); //돈 받기
            return true;
        }
        return false;
    }

    function() public payable{
        
    } 
}