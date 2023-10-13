import { useState } from "react";
import Cookies from "js-cookie";
import { ModalBody, ModalContainer, ModalFooter, ModalHeader } from "./Modal";

export default function Onboarding({ open, onClose }) {
  const [step, setStep] = useState(0);

  const chocolatineName = Cookies.get("chocolatine-name") || "pain au chocolat";
  const chocolatinesName =
    Cookies.get("chocolatines-name") || "pains au chocolat";

  return (
    <ModalContainer
      open={open}
      onClose={onClose}
      blurryBackground
      onAfterLeave={() => setStep(0)}
    >
      <ModalHeader title="Welcome tooo Kiss My Chocolatine ! 🍫" />
      {step === 0 && (
        <ModalBody className="flex flex-col items-center overflow-y-auto sm:p-8">
          <p className="w-full px-4 text-center">
            You'll find here ALL the places where is sold... but actually, how
            do you call this?
          </p>
          <img
            src="/assets/chocolatine-blurred.jpg"
            className="mx-auto my-4 w-[70vw]"
            alt="chocolatine"
          />
          <ChocolatineButton
            onClick={() => setStep(1)}
            value="pain au chocolat"
            plural="pains au chocolat"
          >
            <span aria-roledescription="flag">🇫🇷</span>
            <span aria-roledescription="chocolatine-name">
              Pain au chocolat
            </span>
          </ChocolatineButton>
          <ChocolatineButton
            onClick={() => setStep(1)}
            value="chocolatine"
            plural="chocolatines"
          >
            <span aria-roledescription="flag">🇫🇷</span>
            <span aria-roledescription="chocolatine-name"> Chocolatine</span>
          </ChocolatineButton>
          <ChocolatineButton
            onClick={() => setStep(1)}
            value="petit pain"
            plural="petits pains"
          >
            <span aria-roledescription="flag">🇫🇷</span>
            <span aria-roledescription="chocolatine-name"> Petit pain</span>
          </ChocolatineButton>
          <ChocolatineButton
            onClick={() => setStep(1)}
            value="petit pain au chocolat"
            plural="petits pains au chocolat"
          >
            <span aria-roledescription="flag">🇫🇷</span>
            <span aria-roledescription="chocolatine-name">
              Petit pain au chocolat
            </span>
          </ChocolatineButton>
          <ChocolatineButton
            onClick={() => setStep(1)}
            value="croissant au chocolat"
            plural="croissants au chocolat"
          >
            <span aria-roledescription="flag">🇫🇷</span>
            <span aria-roledescription="chocolatine-name">
              Croissant au chocolat
            </span>
          </ChocolatineButton>
          <ChocolatineButton
            onClick={() => setStep(1)}
            value="couque au chocolat"
            plural="couques au chocolat"
          >
            <span aria-roledescription="flag">🇧🇪</span>
            <span aria-roledescription="chocolatine-name">
              Couque au chocolat
            </span>
          </ChocolatineButton>
          <ChocolatineButton
            onClick={() => setStep(1)}
            value="pain auw chowcowlat"
            plural="pains auw chowcowlat"
          >
            <span aria-roledescription="flag">🇬🇧</span>
            <span aria-roledescription="chocolatine-name">
              Pain auw chowcowlat
            </span>
          </ChocolatineButton>
          <ChocolatineButton
            onClick={() => setStep(1)}
            value="chocolate croissant"
            plural="chocolate croissants"
          >
            <span aria-roledescription="flag">🇬🇧</span>
            <span aria-roledescription="chocolatine-name">
              Chocolate croissant
            </span>
          </ChocolatineButton>
          <ChocolatineButton
            onClick={() => setStep(1)}
            value="chocolade broodje"
            plural="chocolade broodjes"
          >
            <span aria-roledescription="flag">🇳🇱</span>
            <span aria-roledescription="chocolatine-name">
              Chocolade broodje
            </span>
          </ChocolatineButton>
        </ModalBody>
      )}
      {step === 1 && (
        <>
          <ModalBody className="flex flex-col items-center overflow-y-auto sm:p-8">
            <p className="w-full px-4 text-center">
              You'll find here{" "}
              <b className="font-medium underline decoration-[#FFBB01]">
                ALL the places
              </b>{" "}
              where are sold {chocolatinesName}, with the shop{" "}
              <b className="font-medium underline decoration-[#FFBB01]">
                opening hours
              </b>
              , the{" "}
              <b className="font-medium underline decoration-[#FFBB01]">
                ingredients
              </b>{" "}
              of the {chocolatineName}, its{" "}
              <b className="font-medium underline decoration-[#FFBB01]">
                price
              </b>
              , if it's{" "}
              <b className="font-medium underline decoration-[#FFBB01]">
                homemade
              </b>{" "}
              or not, and the{" "}
              <b className="font-medium underline decoration-[#FFBB01]">
                reviews
              </b>{" "}
              from users, following a few criterias:
            </p>
            <ul className="mt-3 list-inside list-disc pl-4 text-left">
              <li>
                <b>Softness/Moelleux</b>: not too soft, not too hard 😇
              </li>
              <li>
                <b>Flakiness/Feuilletage</b>: the original {chocolatineName} IS
                flaky. Butterly flaky. Non butterly flaky {chocolatineName} is a
                bad {chocolatineName} 😖
              </li>
              <li>
                <b>Crispiness/Croustillant</b>: not too crispy, but just a
                soupçon of what makes it great 🤤
              </li>
              <li>
                <b>Fondant</b>: butter, chocolate, flakiness and softness all
                together in your mouth 🤩
              </li>
              <li>
                <b>Chocolate quality</b>
              </li>
              <li>
                <b>Chocolate disposition</b>: a {chocolatineName} has two
                chocolate bars, one on each side. A {chocolatineName} with only
                one chocolate bar, or with thw two bars stuck together is a sad{" "}
                {chocolatineName} 😤
              </li>
              <li>
                <b>Visual aspect</b>: there is quite a pattern, even though some
                bakers are creative. Your subjectivity is welcome here 🤓
              </li>
              <li>
                <b>Global note</b>: independantly from the rest of the
                criterias, this is your global feeling about the{" "}
                {chocolatineName} 🤗
              </li>
            </ul>
            <p>
              Not everyone likes the same {chocolatineName}, so it's not because
              the rates are bad that the product is bad in itself
            </p>
            <img
              src="/assets/pain-au-choc-feuillete.webp"
              className="mx-auto my-4 h-40"
              alt="3 chocolatines"
            />
          </ModalBody>
          <ModalFooter>
            <button
              className="rounded-lg bg-[#FFBB01] px-4 py-2"
              onClick={onClose}
            >
              Alright, let's taste! 🧑‍🍳
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
