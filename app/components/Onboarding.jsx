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
              Vous trouverez ici TOUS les...
              <br />
              mmm attendez, comment appelez-vous ça👇?
            </p>
            <img
              src="/assets/chocolatine-blurred.jpg"
              className="mx-auto my-4 w-[70vw]"
              alt="pain au chocolatine"
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
            <p className="w-full px-4 text-center">
              Vous verrez sur la carte différents pins qui veulent dire:
            </p>
            <ul className="my-4 flex w-full flex-col justify-evenly gap-y-4">
              <li className="flex flex-col items-center">
                <img
                  src="/assets/marker-black.svg"
                  className="h-8 w-8"
                  alt="chocolatine"
                />
                <p className="text-center font-semibold">🧑‍🍳 Fait maison</p>
              </li>
              <li className="flex flex-col items-center">
                <img
                  src="/assets/marker-gray.svg"
                  className="h-8 w-8"
                  alt="chocolatine"
                />
                <p className="text-center font-semibold">🏭 Industriel</p>
              </li>
              <li className="flex flex-col items-center">
                <img
                  src="/assets/marker-white.svg"
                  className="h-8 w-8"
                  alt="chocolatine"
                />
                <p className="text-center font-semibold">
                  🤷 Pas encore visitée
                </p>
              </li>
            </ul>
          </ModalBody>
          <ModalFooter>
            <button
              className="rounded-lg bg-[#FFBB01] px-4 py-2"
              onClick={() => setStep(2)}
            >
              OK ça marche&nbsp;!&nbsp;😋
            </button>
          </ModalFooter>
        </>
      )}
      {step === 2 && (
        <>
          <ModalHeader
            title={`Gagnez de l'argent avec ${newAppName}\u00A0🏦`}
          />
          <ModalBody className="flex flex-col items-center overflow-y-auto sm:p-8">
            <p className="w-full p-4 text-center">
              Chaque utilisateur est actionnaire 🤑 🤑 🤑
            </p>
            <ul className="flex list-inside flex-col items-center gap-y-1 px-4 text-left">
              <li>
                💰{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  Une revue complète ={" "}
                  {mapActionToShares.USER_CHOCOLATINE_CRITERIAS_REVIEW +
                    mapActionToShares.USER_CHOCOLATINE_COMMENT_SCORE}{" "}
                  actions
                </b>
              </li>
              <li>
                💵{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  Un magasin ajouté = {mapActionToShares.USER_SHOP_NEW} actions
                </b>
              </li>
              <li>
                💸{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  L'ajout d'un ami = {mapActionToShares.USER_REFERRAL_CREATER}{" "}
                  actions
                </b>
              </li>
            </ul>
            <p className="p-4 text-sm">
              Si un jour {newAppName} fait de l'argent, vous aurez votre part.
              <br />
              Car pour que {newAppName} fasse de l'argent, il faut que vous
              fassiez plus de contenu (magasins et avis), et que d'autres
              utilisateurs fassent encore plus de contenu.
            </p>
          </ModalBody>
          <ModalFooter>
            <button
              className="rounded-lg bg-[#FFBB01] px-4 py-2"
              onClick={onClose}
            >
              C'est bon j'ai pigé&nbsp;!&nbsp;🧑‍🍳
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
