import React from "react";
import BlogWrapper from "~/components/BlogWrapper";
import BlogEmphasize from "~/components/BlogEmphasize";
import { mapActionToShares } from "~/utils/mapActionToShares";
import { MetaArgs } from "@remix-run/node";

export function meta({ matches, location }: MetaArgs) {
  // https://github.com/remix-run/remix/discussions/6073
  const parentMeta = matches[matches.length - 2].meta ?? [];
  return [
    { title: `Stratégies d'acquisition - Kiss my Chocolatine` },
    {
      property: "og:title",
      content: `Stratégies d'acquisition - Kiss my Chocolatine`,
    },
    {
      property: "twitter:title",
      content: `Stratégies d'acquisition - Kiss my Chocolatine`,
    },
    {
      property: "description",
      content:
        "Ceci est un mémo pour la stratégie de l'entreprise. Comment acquérir des utilisateurs, et des boulangeries.",
    },
    {
      property: "og:description",
      content:
        "Ceci est un mémo pour la stratégie de l'entreprise. Comment acquérir des utilisateurs, et des boulangeries.",
    },
    {
      property: "twitter:description",
      content:
        "Ceci est un mémo pour la stratégie de l'entreprise. Comment acquérir des utilisateurs, et des boulangeries.",
    },
    // you can now add SEO related <links>
    {
      tagName: "link",
      rel: "canonical",
      href: `https://chocolatine.kiss-my.app/${location.pathname}`,
    },
    {
      property: "og:url",
      content: `https://chocolatine.kiss-my.app/${location.pathname}`,
    },
    {
      property: "twitter:url",
      content: `https://chocolatine.kiss-my.app/${location.pathname}`,
    },
    ...parentMeta.filter((meta) => {
      if (meta.title) return false;
      if (meta.property === "og:title") return false;
      if (meta.property === "twitter:title") return false;
      if (meta.property === "description") return false;
      if (meta.property === "og:description") return false;
      if (meta.property === "og:url") return false;
      if (meta.property === "twitter:url") return false;
      if (meta.property === "twitter:description") return false;
      if (meta.tagName === "link" && meta.rel === "canonical") return false;
      return true;
    }),
  ];
}

export default function LOeufOuLaPoule() {
  return (
    <BlogWrapper>
      <h1 className="mb-10 text-3xl font-semibold">Stratégies d'acquisition</h1>
      <p>
        TLDR: Ceci est un mémo pour la stratégie de l'entreprise. Comment
        acquérir des utilisateurs, et des boulangeries.
      </p>
      <h2 className="mb-6 mt-20 block text-2xl font-extrabold">
        Acquisition des utilisateurs
      </h2>
      <ol className="list-inside list-disc">
        <li>LinkedIn</li>
        <li>Facebook</li>
        <li>Instagram ?</li>
        <li>boulangerie-bakery.com</li>
      </ol>
      <h2 className="mb-6 mt-20 block text-2xl font-extrabold">
        Acquisition des boulangeries
      </h2>
      <ol className="list-inside list-disc">
        <li>boulangerie-bakery.com</li>
        <li>Master du Pain au Chocolat</li>
        <li>
          Confédération Nationale de la Boulangerie-Pâtisserie Française (CNBPF)
        </li>
        <li>
          https://www.viennoiseries-maison-valdeloire.fr/pages/trouver-votre-artisan-3.html
        </li>
      </ol>
      <p>Et vous, qu'en pensez-vous&nbsp;?</p>
    </BlogWrapper>
  );
}
