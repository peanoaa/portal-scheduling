/*
 * @Author: leiqw1 leiqw1@lenovo.com
 * @Date: 2026-05-10 20:26:02
 * @LastEditors: leiqw1 leiqw1@lenovo.com
 * @LastEditTime: 2026-05-12 16:30:42
 * @FilePath: \rainbowkit-work\src\components\Info.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useEffect } from "react";
import styles from "../../styles/Home.module.css";
import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  useBalance,
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { ethers, Contract } from "ethers";
import { Address, parseEther } from "viem";
import { abi } from "../../abi/abi";
import { useEthersReadProvider, getSigner } from "../../hooks/ethers";

export default function Tranfer() {
  //ethers
  const provider = useEthersReadProvider();


  // 转账

  const [addressValue, setAddressValue] = useState("");
  const [moneyValue, setMoneyValue] = useState("");
  const [transfering, setTransfering] = useState(false);
  const handleClick = async (addressValue: string, moneyValue: string) => {
    const signer = await getSigner();
    try {
      setTransfering(true);
      const res = await signer.sendTransaction({
        to: addressValue as `0x${string}`,
        value: parseEther(moneyValue),
      });
      console.log(res, "res");
    } catch (error) {
      console.error(error);
    } finally {
      setTransfering(false);
    }

  };

  //   addressBalance
  const [inputValue, setInputValue] = useState("");
  const [queryAddress, setQueryAddress] = useState("");

  const handleClick1 = async () => {
    const bal = await provider?.getBalance(inputValue as `0x${string}`);
    // if (inputValue) {
    //   setQueryAddress(inputValue as `0x${string}`);
    // }
    setQueryAddress(ethers.formatEther(bal as bigint) || "0");
  };

  //   balanceof
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");

  const handleClick2 = async () => {
    try {
      const contract = new Contract(
        "0x4e72Ee9709da48577C2f1E794bEc0C2219c6Caa6",
        abi,
        provider
      );
      const balance = await contract.balanceOf(address as `0x${string}`);
      setBalance(ethers.formatEther(balance as bigint) || "0");
    } catch (err) {
      console.log(err);
    }

  };

  // 监控交易

  const [detected, setDetected] = useState(false);
  useEffect(() => {
    if (!provider) return;

    const contract = new Contract(
      "0x4e72Ee9709da48577C2f1E794bEc0C2219c6Caa6",
      abi,
      provider
    );


    contract.on("Transfer", () => {
      setDetected(true);
    });
  }, [provider]);


  // TokneTransfer

  const [toAddress, setToAddress] = useState("");
  const [moneyvalue, setMoneyValue1] = useState("");
  const [tokenTransfer, setTokenTransfer] = useState(false);


  const onTransfer = async () => {
    const signer = await getSigner();

    const contract = new Contract(
      "0x4e72Ee9709da48577C2f1E794bEc0C2219c6Caa6",
      abi,
      signer
    );
    setTokenTransfer(true);
    try {
      const tx = await contract.transfer(toAddress as Address, parseEther(moneyvalue));
    } catch (err) {
      console.log(err);
    } finally {
      setTokenTransfer(false);
    }

  };

  return (
    <div className={styles.main}>
      {/* tranfer */}
      <div className={styles.main}>
        <div>转账</div>
        <input
          name="address"
          placeholder="请输入账户地址"
          className={styles.input}
          value={addressValue}
          onChange={(e) => setAddressValue(e.target.value)}
        />
        <input
          name="value"
          placeholder="请输入金额"
          className={styles.input}
          value={moneyValue}
          onChange={(e) => setMoneyValue(e.target.value)}
        />
        <button
          className={styles.button}
          onClick={() => handleClick(addressValue, moneyValue)}

        >
          {" "}
          {transfering ? "Confirming..." : "Send"}
        </button>
      </div>

      {/* addressBalance */}
      <div className={styles.main}>
        <div>查地址余额</div>
        <div className={styles.main}>
          <div>
            <input
              placeholder="请输入要查询的地址"
              className={styles.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className={styles.button} onClick={handleClick1}>
              查询
            </button>
            <div className={styles.balance}>余额：{queryAddress || "0"}</div>
          </div>
        </div>
      </div>

      {/* BalanceOf */}
      <div className={styles.main}>
        <div>查ERC20余额</div>
        <div className={styles.main}>
          <div>ERC20合于的BalanceOf方法</div>
          <input
            name="address"
            placeholder="请输入地址"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleClick2} className={styles.button}>
            查询
          </button>
          <div>地址余额为：{balance || "0"}</div>
        </div>
      </div>

      {/* Monitor */}
      <div className={styles.main}>

        <div>
          <div>监控交易</div>
          {detected && <div>监控到了</div>}
        </div>
      </div>

      {/* TokneTransfer */}
      <div className={styles.main}>
        <div>ERC20转账</div>
        <div className={styles.main}>
          <div>ERC20token的转账功能,transfer</div>
          <input
            type="text"
            placeholder="输入接收地址"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="输入转账金额"
            value={moneyvalue}
            onChange={(e) => setMoneyValue1(e.target.value)}
            className={styles.input}
          />
          <button
            className={styles.button}
            onClick={onTransfer}
            disabled={tokenTransfer}
          >
            {tokenTransfer ? "发送中..." : "发送"}
          </button>
        </div>
      </div>
    </div>
  );
}
