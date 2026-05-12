/*
 * @Author: leiqw1 leiqw1@lenovo.com
 * @Date: 2026-05-10 20:26:02
 * @LastEditors: leiqw1 leiqw1@lenovo.com
 * @LastEditTime: 2026-05-12 15:07:17
 * @FilePath: \rainbowkit-work\src\components\Info.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState } from "react";
import styles from "../styles/Home.module.css";
import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  useBalance,
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { Address, parseEther } from "viem";
import { abi } from "../abi/abi";

export default function Tranfer() {
  const [addressValue, setAddressValue] = useState("");
  const [moneyValue, setMoneyValue] = useState("");
  const { sendTransaction, data, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt();
  const handleClick = (addressValue: string, moneyValue: string) => {
    console.log(addressValue, moneyValue, "addressValue,moneyValue");
    const res = sendTransaction({
      to: addressValue as `0x${string}`,
      value: parseEther(moneyValue),
    });
    console.log(res, "res");
  };

  //   addressBalance
  const [inputValue, setInputValue] = useState("");
  const [queryAddress, setQueryAddress] = useState<`0x${string}` | undefined>();
  const { data: balanceData } = useBalance({ address: queryAddress });
  const handleClick1 = () => {
    if (inputValue) {
      setQueryAddress(inputValue as `0x${string}`);
    }
  };

  //   balanceof
  const [address, setAddress] = useState("");
  const [balanceOfData, setBalanceOfData] = useState("");
  const result = useReadContract({
      abi,
      address: "0x4e72Ee9709da48577C2f1E794bEc0C2219c6Caa6" as Address, //合约的地址
      functionName: "balanceOf",
      args: [address as Address],
    });

  const handleClick2 = () => {
    console.log(result, "balanceOf result");
    setBalanceOfData(result.data?.toString() || "0");
  };

  // 监控交易

  const [detected, setDetected] = useState(false);

  useWatchContractEvent({
    address: "0x4e72Ee9709da48577C2f1E794bEc0C2219c6Caa6",
    abi,
    eventName: "Transfer",
    onLogs() {
      setDetected(true);
    },
    syncConnectedChain: true,
  });

  // TokneTransfer

  const [toAddress, setToAddress] = useState("");
  const [moneyvalue, setMoneyValue1] = useState("");

  // ✅ useWriteContract 必须在组件顶层调用（不在函数内部）
  const {
    writeContract,
    isPending: isPendingWrite,
    error,
  } = useWriteContract();

  const onTransfer = () => {
    console.log(toAddress, moneyvalue, "toAddress,moneyvalue");
    // ✅ abi、address、functionName、args 都传给 writeContract 函数
    writeContract({
      abi,
      address: "0x4e72Ee9709da48577C2f1E794bEc0C2219c6Caa6" as Address,
      functionName: "transfer",
      args: [toAddress as Address, parseEther(moneyvalue)],
    });
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
          disabled={isPending}
        >
          {" "}
          {isPending ? "Confirming..." : "Send"}
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
            <div className={styles.balance}>余额：{balanceData?.formatted || "0"}</div>
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
          <div>地址余额为：{balanceOfData}</div>
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
            disabled={isPending}
          >
            {isPending ? "发送中..." : "发送"}
          </button>
          {error && <p style={{ color: "red" }}>{(error as Error).message}</p>}
        </div>
      </div>
    </div>
  );
}
