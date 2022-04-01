import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { parseEther } from "ethers/lib/utils";

task("deposit", "deposit tokens")
    .addParam("amount", "amount to deposit")
    .addParam("account", "amount to deposit")
    .setAction(async function (taskArgs, hre) {
        const network = hre.network.name;
        console.log(network);
        const [...addr] = await hre.ethers.getSigners();
        
        const token = await hre.ethers.getContractAt("Token", process.env.Token_CONTRACT as string);
        const dao = await hre.ethers.getContractAt("Dao", process.env.Dao_CONTRACT as string);
        
        
        await token.mint(taskArgs.account,taskArgs.amount);
        await token.connect(addr[taskArgs.account]).approve(dao.address, taskArgs.amount);
        await dao.connect(addr[taskArgs.account]).deposit(taskArgs.amount);
        console.log('deposit task Done!');

    });
