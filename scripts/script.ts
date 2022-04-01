import {ethers} from "hardhat";

async function main() {
  
  //const Token = await ethers.getContractFactory("Token");
  //const token = await Token.deploy();
  //await token.deployed();

  const Dao = await ethers.getContractFactory("Dao");
  const dao = await Dao.deploy("0xC55d74a292ABB9F85DD9D550590a1F86D6706307",2,300,"0x38702D04D5C7f2d817a367f1061b1ec9CF0503C0");
  await dao.deployed();
  
  //console.log("Token deployed to:", "0x38702D04D5C7f2d817a367f1061b1ec9CF0503C0");
  console.log("Dao deployed to:", dao.address);  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
