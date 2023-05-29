import { inferRouterOutputs } from "@trpc/server";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppRouter } from "~/server/api/root";
import { api } from "~/utils/api";
import { clsx } from "clsx";
import {
  Atom,
  PrimitiveAtom,
  atom,
  useAtom,
  useAtomValue,
  useSetAtom,
} from "jotai";

type Funds = inferRouterOutputs<AppRouter>["funds"]["list"];
type Fund = Funds[number];
type FundWithAtom = Fund & {
  selected: PrimitiveAtom<boolean>;
  clicked: PrimitiveAtom<boolean>;
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <FundsPanel />
      </main>
    </>
  );
};

const FundsPanel = () => {
  const query = useFundsQuery();
  const { selectedFundsAtom, unselectedFundsAtom } = useFundsAtom();

  if (query.isError) {
    return <div className="bg-red-400 px-4 py-2">{query.error.message}</div>;
  }
  return (
    <div className="space-y-2">
      <div className="flex space-x-6">
        <div className="flex w-fit flex-col space-y-4 border-2 p-8">
          <h1 className="font-light text-white">Unselected Funds</h1>
          <FundList funds={unselectedFundsAtom} />
        </div>
        <div className="flex w-fit flex-col space-y-4 border-2 p-8">
          <h1 className="font-light text-white">Selected Funds</h1>
          <FundList funds={selectedFundsAtom} />
        </div>
      </div>
      <AddButton />
    </div>
  );
};

const fundsWithAtom = (data: Funds) => {
  const funds = data.map((fund) => ({
    ...fund,
    selected: atom(false),
    clicked: atom(false),
  }));
  return funds;
};

const useFundsQuery = () => {
  const query = api.funds.list.useQuery(undefined, {
    initialData: [],
  });

  return query;
};

const useFundsAtom = () => {
  const fundsResponse = useFundsQuery();
  const data = useMemo(
    () => fundsWithAtom(fundsResponse.data),
    [fundsResponse.data]
  );

  const unselectedFundsAtom = useMemo(
    () =>
      atom((get) => {
        const funds = data.filter((fund) => get(fund.selected) === false);
        return funds;
      }),
    [data]
  );

  const selectedFundsAtom = useMemo(
    () =>
      atom(
        (get) => {
          const funds = data.filter((fund) => get(fund.selected) === true);
          return funds;
        },
        (get, set) => {
          const clickedFunds = data.filter(
            (fund) => get(fund.clicked) === true
          );
          console.log(clickedFunds);
        }
      ),
    [data]
  );

  return {
    selectedFundsAtom,
    unselectedFundsAtom,
  };
};

const AddButton = () => {
  const { selectedFundsAtom } = useFundsAtom();
  const setSelectedFunds = useSetAtom(selectedFundsAtom);
  const handleClick = () => setSelectedFunds();
  return (
    <button
      className="rounded bg-purple-600 p-3 px-5 text-lg text-white hover:bg-purple-500 hover:shadow-md"
      onClick={handleClick}
    >
      Add
    </button>
  );
};

type FundListProps = {
  funds: Atom<FundWithAtom[]>;
};
const FundList = (props: FundListProps) => {
  const funds = useAtomValue(props.funds);
  return (
    <div className="grid grid-cols-3 gap-2 ">
      {funds.map((fund) => (
        <Chip {...fund} key={fund.id} />
      ))}
    </div>
  );
};

type ChipProps = FundWithAtom;

const Chip = (props: ChipProps) => {
  const [clicked, setClicked] = useAtom(props.clicked);
  const handleClick = () => setClicked((current) => !current);

  return (
    <div
      onClick={handleClick}
      className={clsx(
        "cursor-pointer rounded-xl border border-white px-4 py-1",
        clicked ? "bg-white" : "bg-transparent",
        clicked ? "text-black" : "text-white"
      )}
    >
      {props.name}
    </div>
  );
};

export default Home;
