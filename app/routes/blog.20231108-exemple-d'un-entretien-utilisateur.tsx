import React, { useState, useEffect, useRef } from "react";
import Sortable from "sortablejs";
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
  const gridRef = useRef<HTMLUListElement | null>(null);
  const sortableJsRef = useRef<Sortable | null>(null);

  const initData = [
    "Comment décririez-vous l'approche de votre boulangerie envers la fabrication artisanale de viennoiseries ?",
    "Est-ce que vos viennoiseries sont 'fait maison' ?",
    'Si vous pouviez augmenter votre profit en vendant des viennoiseries "fait maison", comment cela affecterait-il votre planification quotidienne et votre charge de travail ?',
    'Croyez-vous que vos clients seraient prêts à payer un peu plus pour des viennoiseries certifiées "fait maison" ?',
    "Avez-vous déjà tenté de mettre en avant le caractère artisanal de certains de vos produits ? Si oui, quel a été le retour ?",
    `Quel impact pensez-vous que l'appellation "fait maison" aurait sur l'image de votre boulangerie auprès de la clientèle ?`,
    "Comment décririez-vous le marché actuel des viennoiseries dans votre région ? Y a-t-il une tendance vers plus d'authenticité ?",
    'Existe-t-il des traditions ou des techniques particulières que vous utilisez déjà et qui pourraient être valorisées par le label "fait maison" ?',
    "Comment voyez-vous l'avenir de la boulangerie artisanale dans le contexte actuel de l'industrie alimentaire ?",
    'Y-a-t-il des histoires spécifiques de clients qui vous ont marqué et qui montrent leur appréciation pour les produits "fait maison" ?',
    "Comment gérez-vous actuellement l'équilibre entre qualité artisanale et efficacité de production ?",
    'Qu\'est-ce qui, selon vous, distingue un croissant ou un pain au chocolat "fait maison" de ceux produits de manière industrielle ?',
    "Et selon vos clients ?",
    "Avez-vous observé une préférence de vos clients pour les produits plus authentiques ou traditionnels ?",
    "Pouvez-vous me raconter une expérience récente où la qualité 'artisanale' a été un facteur important pour vos clients ?",
    "Avez-vous déjà envisagé d'augmenter votre marge bénéficiaire sur des produits 'fait maison' ? Si oui, quelles seraient les implications ?",
    "Comment intégreriez-vous l'étiquette \"fait maison\" dans l'histoire de votre boulangerie ?",
  ];

  const [data, setData] = useState(initData);

  const onListChange = () => {
    const newData = [...(gridRef?.current?.children ?? [])]
      .map((i) => i.dataset.id)
      .map((id) => data.find((item) => item === id));

    localStorage.setItem("my-grid", JSON.stringify(newData));
    setData(data);
  };

  useEffect(() => {
    if (!gridRef.current) return;
    console.log();
    setData(JSON.parse(localStorage.getItem("my-grid") || "[]") || initData);
    sortableJsRef.current = new Sortable(gridRef.current, {
      animation: 150,
      onEnd: onListChange,
    });
  }, []);

  return (
    <BlogWrapper>
      <h1 className="mb-10 text-3xl font-semibold">
        Exemple d'un entretien utilisateur
      </h1>
      <p>
        Je n'ai pas fini le livre "The Mom Test" par Rob Fitzpatrick, mais
        mettons en pratique ce que j'ai déjà lu.
      </p>
      <p>
        Merci ChatGPT pour tes questions:
        https://chat.openai.com/share/31aaf8b0-2811-4c6c-824c-ad000ab1092c
      </p>
      <ul ref={gridRef} id="questions" className="list-inside list-disc">
        {data.map((question) => {
          return (
            <li
              key={question}
              className="mb-2 cursor-pointer"
              data-id={question}
              onClick={(e) => {
                // toggle strikethrough
                const target = e.target as HTMLElement;
                if (target.style.textDecoration === "line-through") {
                  target.style.textDecoration = "none";
                } else {
                  target.style.textDecoration = "line-through";
                }
              }}
            >
              {question}
            </li>
          );
        })}
      </ul>
    </BlogWrapper>
  );
}
