import React, { useState } from "react";
import Cookies from "js-cookie";
import { ModalBody, ModalContainer, ModalFooter, ModalHeader } from "./Modal";
import useChocolatineName from "~/utils/useChocolatineName";
import aroundtheworld from "~/data/around-the-world.json";
import { mapActionToShares } from "~/utils/mapActionToShares";

export default function Onboarding({ open, onClose }) {
  const [step, setStep] = useState(0);

  const { chocolatinesName, newAppName } = useChocolatineName();

  return (
    <ModalContainer
      open={open}
      onClose={onClose}
      blurryBackground
      onAfterLeave={() => setStep(0)}
    >
      {step === 0 && (
        <>
          <ModalHeader title="Welcome tooo Kiss My Chocolatine ! 🍫" />
          <ModalBody className="flex flex-col items-center overflow-y-auto sm:p-8">
            <p className="w-full px-4 text-center">
              You'll find here ALL the places for...
              <br />
              mmm wait, how do you call this👇?
            </p>
            <img
              src="/assets/chocolatine-blurred.jpg"
              className="mx-auto my-4 w-[70vw]"
              alt="chocolatine"
            />
            {aroundtheworld.map((name) => (
              <ChocolatineButton
                onClick={() => setStep(1)}
                value={name.singular}
                plural={name.plural}
                key={name.singular}
              >
                <span aria-roledescription="flag">{name.flag}</span>
                <span aria-roledescription="chocolatine-name">
                  {name.singular.slice(0, 1).toUpperCase() +
                    name.singular.slice(1)}
                </span>
              </ChocolatineButton>
            ))}
          </ModalBody>
        </>
      )}
      {step === 1 && (
        <>
          <ModalHeader title={`Welcome tooo ${newAppName}\u00A0!\u00A0🍫`} />
          <ModalBody className="flex flex-col items-center overflow-y-auto py-4 sm:p-8">
            <p className="w-full px-4 text-center">You'll find here </p>
            <ul className="mt-3 list-inside px-4 text-left">
              <li>
                🍽️&nbsp;&nbsp;
                <b className="font-medium underline decoration-[#FFBB01]">
                  ALL the places
                </b>{" "}
                for {chocolatinesName}
              </li>
              <li>
                ⏰&nbsp;&nbsp;
                <b className="font-medium underline decoration-[#FFBB01]">
                  opening hours
                </b>
              </li>
              <li>
                🍫&nbsp;&nbsp;
                <b className="font-medium underline decoration-[#FFBB01]">
                  ingredients
                </b>
              </li>
              <li>
                🏷️&nbsp;&nbsp;
                <b className="font-medium underline decoration-[#FFBB01]">
                  price
                </b>
              </li>
              <li>
                🧑‍🍳&nbsp;&nbsp;
                <b className="font-medium underline decoration-[#FFBB01]">
                  homemade
                </b>{" "}
                or not
              </li>
              <li>
                🕵️&nbsp;&nbsp;
                <b className="font-medium underline decoration-[#FFBB01]">
                  detailed reviews
                </b>{" "}
                from ALL OF YOU
              </li>
            </ul>
            <img
              src="/assets/pain-au-choc-feuillete.webp"
              className="mx-auto my-4 h-40"
              alt="3 chocolatines"
            />
          </ModalBody>
          <ModalFooter>
            <button
              className="rounded-lg bg-[#FFBB01] px-4 py-2"
              onClick={() => setStep(2)}
            >
              Sounds good!&nbsp;😋
            </button>
          </ModalFooter>
        </>
      )}
      {step === 2 && (
        <>
          <ModalHeader title={`Make money by using ${newAppName}\u00A0🏦`} />
          <ModalBody className="flex flex-col items-center overflow-y-auto sm:p-8">
            <p className="w-full p-4 text-center">
              All users are shareholders 🤑 🤑 🤑
            </p>
            <ul className="list-inside px-4 text-left">
              <li>
                💰{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  One complete review ={" "}
                  {mapActionToShares.USER_CHOCOLATINE_CRITERIAS_REVIEW +
                    mapActionToShares.USER_CHOCOLATINE_COMMENT_SCORE}{" "}
                  shares
                </b>
              </li>
              <li>
                💵{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  One new shop = {mapActionToShares.USER_SHOP_NEW} shares
                </b>
              </li>
              <li>
                💸{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  One referral = {mapActionToShares.USER_REFERRAL_CREATER}{" "}
                  shares
                </b>
              </li>
            </ul>
            <p className="p-4">
              If one day {newAppName} makes money, you'll get your fair share.
              Because for {newAppName} to make money, we need you to do more
              content (shops and reviews), and more other users to do event more
              content.
            </p>
          </ModalBody>
          <ModalFooter>
            <button
              className="rounded-lg bg-[#FFBB01] px-4 py-2"
              onClick={onClose}
            >
              Bring me there!&nbsp;🧑‍🍳
            </button>
          </ModalFooter>
        </>
      )}
    </ModalContainer>
  );
}

function ChocolatineButton({ children, onClick, value, plural }) {
  return (
    <button
      type="button"
      className={[
        "mb-1 inline-flex gap-2 rounded-lg border border-gray-300 px-4 py-1",
        "plausible-event-name=chocolatine+name",
        `plausible-event-value=${value.split(" ").join("+")}`,
      ].join(" ")}
      onClick={() => {
        Cookies.set("chocolatine-name", value, { expires: 7 }); // expires in 7 days
        Cookies.set("chocolatines-name", plural, { expires: 7 });
        onClick();
      }}
    >
      {children}
    </button>
  );
}
