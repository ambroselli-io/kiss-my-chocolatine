import React from "react";
import BlogWrapper from "~/components/BlogWrapper";
import BlogEmphasize from "~/components/BlogEmphasize";
import { mapActionToShares } from "~/utils/mapActionToShares";
import { MetaArgs } from "@remix-run/node";

export function meta({ matches, location }: MetaArgs) {
  // https://github.com/remix-run/remix/discussions/6073
  const parentMeta = matches[matches.length - 2].meta ?? [];
  return [
    { title: `L'oeuf ou la poule ? - Kiss my Chocolatine` },
    {
      property: "og:title",
      content: `L'oeuf ou la poule ? - Kiss my Chocolatine`,
    },
    {
      property: "twitter:title",
      content: `L'oeuf ou la poule ? - Kiss my Chocolatine`,
    },
    {
      property: "description",
      content:
        "Référencer beaucoup de boulangeries ramènera beaucoup d'utilisateurs. Et référencer beaucoup d'utilisateurs ramènera beaucoup de boulangeries. Par quoi commencer ?",
    },
    {
      property: "og:description",
      content:
        "Référencer beaucoup de boulangeries ramènera beaucoup d'utilisateurs. Et référencer beaucoup d'utilisateurs ramènera beaucoup de boulangeries. Par quoi commencer ?",
    },
    {
      property: "twitter:description",
      content:
        "Référencer beaucoup de boulangeries ramènera beaucoup d'utilisateurs. Et référencer beaucoup d'utilisateurs ramènera beaucoup de boulangeries. Par quoi commencer ?",
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
      if ("title" in meta) return false;
      if ("property" in meta && meta.property === "og:title") return false;
      if ("property" in meta && meta.property === "twitter:title") return false;
      if ("property" in meta && meta.property === "description") return false;
      if ("property" in meta && meta.property === "og:description")
        return false;
      if ("property" in meta && meta.property === "og:url") return false;
      if ("property" in meta && meta.property === "twitter:url") return false;
      if ("property" in meta && meta.property === "twitter:description")
        return false;
      if (
        "tagName" in meta &&
        "rel" in meta &&
        meta.tagName === "link" &&
        meta.rel === "canonical"
      )
        return false;
      return true;
    }),
  ];
}

export default function LOeufOuLaPoule() {
  return (
    <BlogWrapper>
      <h1 className="mb-10 text-3xl font-semibold">
        L'oeuf ou la poule&nbsp;?
      </h1>
      <p>
        TLDR: Référencer beaucoup de boulangeries ramènera beaucoup
        d'utilisateurs. Et référencer beaucoup d'utilisateurs ramènera beaucoup
        de boulangeries. Par quoi commencer&nbsp;?
      </p>
      <h2 className="mb-6 mt-20 block text-2xl font-extrabold">
        Si JE devais ramener d'abord plein de boulangeries...
      </h2>
      <p>
        Quand je dis JE en majuscules, c'est parce que c'est seulement moi,
        Arnaud Ambroselli, fondateur de Kiss My Chocolatine.
      </p>
      <p>
        Quand je dis JE en majuscules, c'est parce que s'il n'y a pas encore
        d'utilisateurs qui participent, c'est à moi de référencer les
        boulangeries. S'il y a de la trésorerie, je pourrais embaucher quelqu'un
        pour le faire, mais pour l'instant, c'est moi.
      </p>
      <p>
        Mais je pense que, même avec un peu de trésorerie, à la rigueur on peu
        conquérir les ~2000 boulangeries de Paris, mais celles de la France
        entière, c'est une autre histoire.
      </p>
      <BlogEmphasize>Mission impossible.</BlogEmphasize>
      <h2 className="mb-6 mt-20 block text-2xl font-extrabold">
        Alors il faut des utilisateurs&nbsp;?
      </h2>
      <p>
        Essayer de faire participer les utilisateurs. Mais, comme me le dit si
        bien ChatGPT en co-écrivant cet article de blog, pour ça il faut qu'il y
        ait des utilisateurs. Et pour qu'il y ait des utilisateurs, il faut
        qu'il y ait des boulangeries. Merci ChatGPT.
      </p>
      <h2 className="mb-6 mt-20 block text-2xl font-extrabold">
        Une solution: l'utilisateur actionnaire&nbsp;🥸
      </h2>
      <p>
        Avoir une petite équipe pour couvrir la France entière, c'est mission
        impossible, donc il faut que les utilisateurs participent. Point final.
      </p>
      <p>
        Pour inciter les utilisateurs à participer, à renseigner des
        boulangeries partout où ils sont, il faut qu'ils aient un intérêt à le
        faire.
      </p>
      <p>
        Le seul intérêt de la passion pour le pain au chocolat, je n'y crois
        pas. C'est pourquoi j'ai pensé qu'il fallait intéresser les utilisateurs
        à TOUTE participation ou promotion de Kiss My Chocolatine.
      </p>
      <ol className="list-inside list-disc">
        <li>
          Pour chaque boulangerie renseignée, {mapActionToShares.USER_SHOP_NEW}{" "}
          actions
        </li>
        <li>
          Pour chaque revue de pain au chocolat,{" "}
          {mapActionToShares.USER_CHOCOLATINE_CRITERIAS_REVIEW} actions
        </li>
        <li>
          Pour chaque note de pain au chocolat,{" "}
          {mapActionToShares.USER_CHOCOLATINE_COMMENT_SCORE} actions
        </li>
        <li>
          Pour chaque remplissage des ingrédients,{" "}
          {mapActionToShares.USER_CHOCOLATINE_INGREDIENTS} actions
        </li>
        <li>
          Pour chaque nouvel utilisateur parrainé,{" "}
          {mapActionToShares.USER_REFERRAL_CREATER} actions
        </li>
        <li>
          Pour chaque like sur les réseaux sociaux,{" "}
          {mapActionToShares.USER_LINKEDIN_LIKE} actions
        </li>
        <li>
          Pour chaque partage sur les réseaux sociaux,{" "}
          {mapActionToShares.USER_LINKEDIN_SHARE} actions
        </li>
        <li>
          Pour chaque commentaire sur les réseaux sociaux,{" "}
          {mapActionToShares.USER_LINKEDIN_COMMENT} actions
        </li>
        <li>
          Pour chaque post mentionnant Kiss My Chocolatine sur les réseaux
          sociaux, {mapActionToShares.USER_LINKEDIN_POST} actions
        </li>
      </ol>
      <BlogEmphasize>
        Ainsi, on incite les utilisateurs à être nombreux - ce qui aurait de
        toutes façons été la mission - et à renseigner les boulangeries et pains
        au chocolat.
      </BlogEmphasize>
      <p>
        Il sera peut-être alors plus convaincant d'aller aborder les
        boulangeries d'une manière ou d'une autre par la suite.
      </p>
      <p>Et vous, qu'en pensez-vous&nbsp;?</p>
    </BlogWrapper>
  );
}
