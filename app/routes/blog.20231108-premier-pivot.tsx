import React from "react";
import BlogWrapper from "~/components/BlogWrapper";
import BlogEmphasize from "~/components/BlogEmphasize";
import { mapActionToShares } from "~/utils/mapActionToShares";
import { MetaArgs } from "@remix-run/node";

export function meta({ matches, location }: MetaArgs) {
  // https://github.com/remix-run/remix/discussions/6073
  const parentMeta = matches[matches.length - 2].meta ?? [];
  return [
    { title: `Premier pivot - Kiss my Chocolatine` },
    {
      property: "og:title",
      content: `Premier pivot - Kiss my Chocolatine`,
    },
    {
      property: "twitter:title",
      content: `Premier pivot - Kiss my Chocolatine`,
    },
    {
      property: "description",
      content:
        "Objectif: Valoriser le fait-maison et booster le prix de vente des délices boulangers!",
    },
    {
      property: "og:description",
      content:
        "Objectif: Valoriser le fait-maison et booster le prix de vente des délices boulangers!",
    },
    {
      property: "twitter:description",
      content:
        "Objectif: Valoriser le fait-maison et booster le prix de vente des délices boulangers!",
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

export default function LePremierPivotDeKMC() {
  return (
    <BlogWrapper>
      <h1 className="mb-10 text-3xl font-semibold">
        Le Premier Pivot de Kiss My Chocolatine est lancé!
      </h1>
      <p>
        PIVOT! PIVOT!! Le premier pivot de Kiss My Chocolatine (KMC) est prêt à
        transformer le marché des viennoiseries. 🍾
      </p>
      <BlogEmphasize>
        Objectif: Valoriser le fait-maison et booster le prix de vente des
        délices boulangers!
      </BlogEmphasize>
      <p>
        Constats: <br />
        🌈 Les viennoiseries (et particulièrement les pains au choc), c'est la
        vie
        <br />
        🤒 Mais 80% d'entre elles seraient industrielles (source:
        https://lnkd.in/e9dRJYTu) Pourquoi certains boulangers font ce choix ?
      </p>
      <p>
        Pourquoi certains boulangers font ce choix? Trois raisons principales :
        <ol className="list-inside list-decimal">
          <li>
            C'est beaucoup plus rentable: un indus coûte 15c, un artisanal coûte
            60c
          </li>
          <li>
            Il n'y a pas obligation de préciser si c'est fait-maison ou pas,
            donc on peut mentir par omission au consommateur
          </li>
          <li>
            Boulanger est un métier difficile, qui prend beaucoup de temps - si
            on peut faire ça en moins, c'est ça de gagné
          </li>
        </ol>
      </p>
      <p>
        Sauf qu'une viennoiserie industrielle, même si ça peut être bon (tant
        qu'il y a du bon beurre, de la bonne farine), c'est pas pareil. C'est
        comme les boîtes de conserve: c'est bon, mais ça vaut pas un gastro.
      </p>
      <BlogEmphasize>
        L'amour est un ingrédient au goût incomparable.
      </BlogEmphasize>
      <p>
        Mais l'amour a un prix:
        <br />
        💰45c par viennoiserie.
        <br />
        🕰️ des heures de travail en plus
      </p>
      <p>
        Il faut donc partir à la rescousse des croissants, pains au chocolats et
        autres chouquettes !
      </p>
      <p>
        Pour ça, vivre à l'étranger m'a aidé à me décoincer sur un aspect
        CRUCIAL de la boulangerie française en général: le prix de vente des
        produits de boulangerie sont RI-DI-CULES 💸
      </p>
      <p>
        🥖 Baguette: minimum 2€ à l'étranger (et mauvaise en plus), 1.20€ en
        France (et excellente)
        <br />
        🥐 Pain au chocolat: à 2€ on a de l'indus bas-de-gamme, à 1.35€ en
        France on a du fait-maison des étoiles ✨
      </p>
      <p>
        La question qui tue: est-ce que ça changerait le monde du consommateur
        si on changeait quelques prix de base en boulangerie ?
      </p>
      <p>
        Disons
        <br />
        🥖 Baguette: 2€
        <br />
        🥐 Croissant/Pain au chocolat: 2€
      </p>
      <p>
        Exemple au doigt mouillé: avec une moyenne au doigt mouillé de 300 par
        boulangerie par jour, 240 jours par an, le surplus de 0.80c fait
        potentiellement 50k de CA supplémentaire par an.
      </p>
      <BlogEmphasize>😳</BlogEmphasize>
      <p>
        Ça permettrait peut-être à nos boulangers de BIEN VIVRE de leur passion,
        non ? Et nous d'avoir des merveilles à se mettre sous la langue 😋
      </p>
      <p>
        La perspective me fait rêver, et je pense qu'à nous tous on peut faire
        quelque chose.
      </p>
      <p>
        Si on transforme Kiss My Chocolatine en Label Fait Maison de renom,
        reconnu, réputé, alors on fait coup triple:
        <br />
        🥇On sait où trouver une viennoiserie faite maison
        <br />
        🥈On permet aux boulangeries qui ont ce label de légitimer la hausse de
        prix de leurs viennoiseries, et donc de vouloir bannir l'indus pour
        revenir au fait maison
        <br />
        🥉On sauve le monde, tout simplement. En toute humilité bien sûr. Mais
        soyons honnêtes:
      </p>
      <p>
        🌍 On sauve le monde d'une industrialisation globale qui standardise
        tout et retire la beauté, que dis-je, la magnificence de l'artisanat
        <br />
        🌍 On revalorise le métier de boulanger, essentiel, vital, mais si mal
        payé
        <br />
        🌍 On se sauve nous, consommateurs, à nous réapprendre à apprécier les
        bonnes choses, à une juste valeur. Et à en vouloir plus. Fini l'indus.
      </p>
      <p>Qu'en pensez-vous ?</p>
    </BlogWrapper>
  );
}
