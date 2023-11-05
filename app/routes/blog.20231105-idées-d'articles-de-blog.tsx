import React from "react";
import BlogWrapper from "~/components/BlogWrapper";
import BlogEmphasize from "~/components/BlogEmphasize";
import { mapActionToShares } from "~/utils/mapActionToShares";
import { MetaArgs } from "@remix-run/node";

export function meta({ matches, location }: MetaArgs) {
  // https://github.com/remix-run/remix/discussions/6073
  const parentMeta = matches[matches.length - 2].meta ?? [];
  return [
    { title: `Idées d'articles de blog - Kiss my Chocolatine` },
    {
      property: "og:title",
      content: `Idées d'articles de blog - Kiss my Chocolatine`,
    },
    {
      property: "twitter:title",
      content: `Idées d'articles de blog - Kiss my Chocolatine`,
    },
    {
      property: "description",
      content:
        "Ceci est un mémo pour des idées d'article de blog, ou de post sur les réseaux sociaux.",
    },
    {
      property: "og:description",
      content:
        "Ceci est un mémo pour des idées d'article de blog, ou de post sur les réseaux sociaux.",
    },
    {
      property: "twitter:description",
      content:
        "Ceci est un mémo pour des idées d'article de blog, ou de post sur les réseaux sociaux.",
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
      <h1 className="mb-10 text-3xl font-semibold">Idées d'articles de blog</h1>
      <p>
        TLDR: Ceci est un mémo pour des idées d'article de blog, ou de post sur
        les réseaux sociaux.
      </p>
      <h2 className="mb-6 mt-20 block text-2xl font-extrabold">
        Articles de blog
      </h2>
      <ol className="list-inside list-disc">
        <li>Objectif: vendre les pains au chocolat plus cher.</li>
        <li>Business plan: label de qualité ?</li>
      </ol>
      <h2 className="mb-6 mt-20 block text-2xl font-extrabold">
        Réseaux sociaux
      </h2>
      <ol className="list-inside list-disc">
        <li>Et on a ouvert en Espagne 🤠 🇪🇸 </li>
        <li>pain-au-chocolat.kiss-my.app</li>
        <li>Objectif: vendre les pains au chocolat plus cher.</li>
        <li>
          80% de pains au choc industriels: on veut être un label de qualité
        </li>
        <li>L'oeuf ou la poule</li>
      </ol>
      <p>Et vous, qu'en pensez-vous&nbsp;?</p>
    </BlogWrapper>
  );
}
