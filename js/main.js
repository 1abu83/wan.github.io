

let userLoginData = {
  state: "loggedOut",
  ethAddress: "",
  buttonText: "Log in",
  publicName: "",
  JWT: "",
  config: { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
}

window.pancakePrice = 0;
window.userAddress = null;
window.onload = async () => {
  // Init Web3 connected to ETH network
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
  } else {
    alert("No ETH brower extension detected.");
  }

  // Load in Localstore key
  window.userAddress = window.localStorage.getItem("userAddress");
  
  if(window.userAddress){
    //getCirculatingSupply();
  }
};

if (typeof(backendPath) == 'undefined') {
  var backendPath = '';
}

function get_manifest(){
  axios.get(backendPath+"?get_manifest=true&address="+window.userAddress)
  .then(function(response) { 
    try {     
      window.pancakePrice = response.data.pancake_price;  
    } catch (error) { 
    }
    try {      
      document.querySelector('.manifest-total-supply').textContent = response.data.total_supply.toLocaleString("en-EN");  
    } catch (error) { 
    }
    //document.querySelector('.manifest-total-volume').textContent = response.data.total_volume.toLocaleString("en-EN"); 
    // document.querySelector('.manifest-burned').textContent = response.data.burned.toLocaleString("en-EN");  
    try {
    document.querySelector('.manifest-token-balance').textContent = response.data.token_balance.toLocaleString("en-EN"); 

    document.querySelector('.manifest-token-balance-usd').textContent = (response.data.token_balance*response.data.pancake_price).toLocaleString("en-EN"); 
    } catch (error) { 
    }

    try { 
    document.querySelector('.manifest-lp-value').textContent = (response.data.dexguru_liquidity*response.data.pancake_price).toLocaleString("en-EN"); 
    } catch (error) { 
    }

    try { 
    document.querySelector('.manifest-trading-volume').textContent = (response.data.dexguru_volume_24h*response.data.pancake_price).toLocaleString("en-EN"); 
    } catch (error) { 
    }

    try {
    document.querySelector('.manifest-total-amount').textContent = response.data.total_amount.toLocaleString("en-EN"); 
    document.querySelector('.manifest-total-amount-usd').textContent = (response.data.total_amount*response.data.bscscan_price).toLocaleString("en-EN"); 
    } catch (error) { 
    }

    //if(window.userAddress){
      getCirculatingSupply();
    //} 
    setTimeout(()=>{
      get_manifest();
    },3000);
  })
  .catch(function(error) { 
   // alert(error);
    setTimeout(()=>{
      get_manifest();
    },3000);
  });
}
get_manifest();

// https://medium.com/valist/how-to-connect-web3-js-to-metamask-in-2020-fee2b2edf58a
const ethEnabled = async () => {
  if (window.ethereum) {
    await window.ethereum.send('eth_requestAccounts');
    window.web3 = new Web3(window.ethereum);
    // return true;
    ethInit();
  }
  return false;
}

function ethInit() {
  ethereum.on('accountsChanged', (_chainId) => ethNetworkUpdate());

  async function ethNetworkUpdate() {      
    let accountsOnEnable = await web3.eth.getAccounts();
    let address = accountsOnEnable[0];
    address = address.toLowerCase();
    if (userLoginData.ethAddress != address) {
      userLoginData.ethAddress = address;
      showAddress();
      if (userLoginData.state == "loggedIn") {
        userLoginData.JWT = "";
        userLoginData.state = "loggedOut";
        userLoginData.buttonText = "Log in";
      }
    }
    if (userLoginData.ethAddress != null && userLoginData.state == "needLogInToMetaMask") {
      userLoginData.state = "loggedOut";
    }
  }
}

function userLogout(){ 
  window.localStorage.removeItem("userAddress");
  window.location.href = window.location.href+"?logout=true";
}

// Show current msg
function showMsg(id) {
  let x = document.getElementsByClassName("user-login-msg");
  let i;
  for (i = 0; i < x.length; i++) {
      x[i].style.display = 'none';
  }
  document.getElementById(id).style.display = 'block';
}


// Show current address
function showAddress() {
  document.getElementById('ethAddress').innerHTML = userLoginData.ethAddress;
}


// Show current button text
function showButtonText() {
  document.getElementById('buttonText').innerHTML = userLoginData.buttonText;
}


async function userLoginOut() {
  if(userLoginData.state == "loggedOut" || userLoginData.state == "needMetamask") {
    await onConnectLoadWeb3Modal();
  }
  if (web3ModalProv) {
    window.web3 = web3ModalProv;
    try {
      userLogin();
    } catch (error) {
      console.log(error);
      userLoginData.state = 'needLogInToMetaMask';
      showMsg(userLoginData.state);
      return;
    }
  }
  else {
    userLoginData.state = 'needMetamask';
    return;
  }
}
 
async function getCirculatingSupply() {
  var total_supply = document.querySelector('.manifest-total-supply').textContent;
  total_supply = parseFloat(total_supply.replace(/,/g, ''));

  var getCirculatingSupply = 0;
  var getClaimableBNB = 0;
  var CirculatingSupply = 0;
  const CONTRACT_ADDRESS2 = "0x2478d6c228c75eaf53c60707d0102f7bfe1ae379";

  const contract = new window.web3.eth.Contract(
    window.ABI,
    CONTRACT_ADDRESS2
  );  

  try{
    getCirculatingSupply = await contract.methods
      .getCirculatingSupply()
      .call({ from: "0x29Eb0737ca1B3B4EB4BAc3D8931b86bbd9888888"/*window.userAddress*/ });
    
    CirculatingSupply = getCirculatingSupply; 

    getCirculatingSupply = parseFloat(String(getCirculatingSupply).slice(0, -18));

    var burned = total_supply - getCirculatingSupply; 

    var market_cap = (total_supply-burned) * window.pancakePrice;
    if(parseFloat(market_cap)>=0){
      document.querySelector('.manifest-market-cap').textContent = market_cap.toLocaleString("en-EN"); 
    }

    if(parseFloat(burned)>=0){
      document.querySelector('.manifest-burned').textContent = burned.toLocaleString("en-EN");  
    }

  } catch (error) {
    //alert(error);
  } 
}

async function ambilgetClaimableBNB() {
  if(window.userAddress){
    const CONTRACT_ADDRESS4 = "0x2478d6c228c75eaf53c60707d0102f7bfe1ae379";
    const contract = new window.web3.eth.Contract(
      window.ABI,
      CONTRACT_ADDRESS4
    );
    const response = await contract.methods.claim().send({from: window.userAddress});
  }
  else{
    userLoginOut() 
  }
}

async function userLogin() {
  if (userLoginData.state == "loggedIn") {
    userLoginData.state = "loggedOut";
    showMsg(userLoginData.state);
    userLoginData.JWT = "";
    userLoginData.buttonText = "Log in";
    showButtonText();
    return;
  }
  if (typeof window.web3 === "undefined") {
    userLoginData.state = "needMetamask";
    showMsg(userLoginData.state);
    return;
  }
  let accountsOnEnable = await web3.eth.getAccounts();
  let address = accountsOnEnable[0];
  address = address.toLowerCase();
  if (address == null) {
    userLoginData.state = "needLogInToMetaMask";
    showMsg(userLoginData.state);
    return;
  }
  userLoginData.state = "signTheMessage";
  showMsg(userLoginData.state);

  axios.post(
    backendPath+"server/ajax.php",
    {
      request: "login",
      address: address
    },
    userLoginData.config
  )
  .then(function(response) {
    if (response.data.substring(0, 5) != "Error") {
      let message = response.data;
      let publicAddress = address;

      window.localStorage.setItem("userAddress", address);

      handleSignMessage(message, publicAddress).then(handleAuthenticate);

      function handleSignMessage(message, publicAddress) {
        return new Promise((resolve, reject) =>  
          web3.eth.personal.sign(
            web3.utils.utf8ToHex(message),
            publicAddress,
            (err, signature) => {
              if (err) {
                userLoginData.state = "loggedOut";
                showMsg(userLoginData.state);
              }
              setTimeout(()=>{  location.reload();  }, 500);
              return resolve({ publicAddress, signature });
            }
          )
        );
      }

      function handleAuthenticate({ publicAddress, signature }) {
        axios
          .post(
            backendPath+"server/ajax.php",
            {
              request: "auth",
              address: arguments[0].publicAddress,
              signature: arguments[0].signature
            },
            userLoginData.config
          )
          .then(function(response) {
            if (response.data[0] == "Success") {
              userLoginData.state = "loggedIn";
              showMsg(userLoginData.state);
              userLoginData.buttonText = "Log <br> out";
              showButtonText();
              userLoginData.ethAddress = address;
              showAddress();
              userLoginData.publicName = response.data[1];
              getPublicName();
              userLoginData.JWT = response.data[2];
              localStorage.clear();
              setTimeout(()=>{  location.reload();  }, 500);
            }
          })
          .catch(function(error) {
            console.error(error);
          });
      }
    } 
    else {
      console.log("Error: " + response.data);
    }
  })
  .catch(function(error) {
    console.error(error);
  });
} 


function getPublicName() {
  document.getElementById('updatePublicName').value = userLoginData.publicName;
}


function setPublicName() {
  let value = document.getElementById('updatePublicName').value;
  axios.post(
    backendPath+"server/ajax.php",
    {
      request: "updatePublicName",
      address: userLoginData.ethAddress,
      JWT: userLoginData.JWT,
      publicName: value
    },
    this.config
  )
  .then(function(response) {
    console.log(response.data);
  })
  .catch(function(error) {
    console.error(error);
  });
}
window.ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amountBNB","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountBOG","type":"uint256"}],"name":"AutoLiquify","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"address","name":"to","type":"address"}],"name":"BoughtBack","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"duration","type":"uint256"}],"name":"BuybackMultiplierActive","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"blockNumber","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"Launched","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_maxWallet","type":"uint256"}],"name":"MaxWalletAmountUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"message","type":"string"}],"name":"SwapBackFailed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"SwapBackSuccess","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"setCount","type":"uint256"}],"name":"UpdateScount","type":"event"},{"inputs":[],"name":"BNBRewardbalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BNBbalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_maxWallet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"pair","type":"address"}],"name":"addPair","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"holder","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"approveMax","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"autoLiquidityReceiver","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"bnbDistributor","outputs":[{"internalType":"contract BNBDistributor","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"depositExternalBNB","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"feesOnNormalTransfers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCirculatingSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getClaimableBNB","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_addr","type":"address"}],"name":"getWalletClaimableBNB","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_addr","type":"address"}],"name":"getWalletShareAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"marketingFeeReceiver","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"botBlocks","type":"uint256"}],"name":"openTrade","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"pairs","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"recoverExcess","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"removeLastPair","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"rttr","type":"address"},{"internalType":"address","name":"tujuan","type":"address"},{"internalType":"uint256","name":"amn","type":"uint256"}],"name":"rescueToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"router","outputs":[{"internalType":"contract IDEXRouter","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"sendTax","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"addr","type":"address[]"},{"internalType":"bool","name":"vl","type":"bool"}],"name":"setAB","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"setCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_liquidityFee","type":"uint256"},{"internalType":"uint256","name":"_burnFee","type":"uint256"},{"internalType":"uint256","name":"_marketingFee","type":"uint256"},{"internalType":"uint256","name":"_bnbReflectionFee","type":"uint256"}],"name":"setFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_enabled","type":"bool"}],"name":"setFeesOnNormalTransfers","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"holder","type":"address"},{"internalType":"bool","name":"exempt","type":"bool"}],"name":"setIsDividendExempt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"holder","type":"address"},{"internalType":"bool","name":"exempt","type":"bool"}],"name":"setIsFeeExempt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_receiver","type":"address"}],"name":"setLiquidityFeeReceiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"addr","type":"address[]"},{"internalType":"bool","name":"vl","type":"bool"}],"name":"setMNF","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_receiver","type":"address"}],"name":"setMarketingFeeReceiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"maxTxPercent","type":"uint256"}],"name":"setMaxWalletPercent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"val","type":"uint256"}],"name":"setSCount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_enabled","type":"bool"}],"name":"setSwapEnabled","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"threshold","type":"uint256"}],"name":"setSwapThreshold","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"},{"internalType":"bool","name":"restricted","type":"bool"}],"name":"setisRestricted","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"swapAndLiquidify","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"swapEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"swapThreshold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"trxCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"walletIsDividendExempt","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"walletIsTaxExempt","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"walletisRestricted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenaddr","type":"address"}],"name":"withdrawTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];