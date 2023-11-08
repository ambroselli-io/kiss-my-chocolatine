import { Form, useSearchParams, useSubmit } from "@remix-run/react";
import type { CustomFeatureCollection } from "~/types/geojson";

type Props = {
  geojson_included_by_filters: CustomFeatureCollection;
};

export default function ChocolatinesFilters({
  geojson_included_by_filters,
}: Props) {
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const total = Array.from(searchParams).length;

  return (
    <details className="border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2">
      <summary className="font-bold">
        Filtres {total > 0 ? `(${total})` : "👀 "}{" "}
        {total > 0 ? (
          <small className="font-normal opacity-25">
            {" "}
            - {geojson_included_by_filters.features.length} boulangeries
          </small>
        ) : (
          ""
        )}
      </summary>
      <Form
        className="mt-2 flex flex-col gap-2 px-2"
        method="get"
        onChange={(e) => submit(e.currentTarget)}
      >
        <CheckBoxesCategory
          title="⏱️ Ouvert maintenant"
          name="opened_now"
          values={[
            { label: "Oui", value: 1 },
            { label: "Non", value: 0 },
          ]}
        />
        <CheckBoxesCategory
          title="🧑‍🍳 Fait maison"
          name="homemade"
          values={[
            { label: "Oui", value: 1 },
            { label: "Non", value: 0 },
          ]}
        />
        <CheckBoxesCategory
          title="🏷️ Prix"
          name="price"
          values={[
            { label: "Moins de 1€", value: 1 },
            { label: "1€ à 2€", value: 2 },
            { label: "2€ à 3€", value: 3 },
            { label: "Plus de 3€", value: 4 },
          ]}
        />
        <CheckBoxesCategory
          name="average_buttery"
          title="🧈 Beurré"
          values={[
            { label: "Pas du tout", value: -2 },
            { label: "Pas beaucoup", value: -1 },
            { label: "Équilibré ⚖️", value: 0 },
            { label: "Beaucoup", value: 1 },
            { label: "QUE du beurre", value: 2 },
          ]}
        />
        <CheckBoxesCategory
          name="average_flaky_or_brioche"
          title="🔪 Feuilleuté ou Brioché"
          values={[
            { label: "Très feuilleté", value: -2 },
            { label: "Feuilleté", value: -1 },
            { label: "Équilibré ⚖️", value: 0 },
            { label: "Brioché", value: 1 },
            { label: "Très brioché", value: 2 },
          ]}
        />
        <CheckBoxesCategory
          name="average_golden_or_pale"
          title="👑 Doré ou Pâle"
          values={[
            { label: "Très doré", value: -2 },
            { label: "Doré", value: -1 },
            { label: "Équilibré ⚖️", value: 0 },
            { label: "Pâle", value: 1 },
            { label: "Très pâle", value: 2 },
          ]}
        />
        <CheckBoxesCategory
          name="average_crispy_or_soft"
          title="🍦 Croustillant ou moelleux"
          values={[
            { label: "Très croustillant", value: -2 },
            { label: "Croustillant", value: -1 },
            { label: "Équilibré ⚖️", value: 0 },
            { label: "Moelleux", value: 1 },
            { label: "Très moelleux", value: 2 },
          ]}
        />
        <CheckBoxesCategory
          name="average_light_or_dense"
          title="🧱 Aéré ou dense"
          values={[
            { label: "Très aéré", value: -2 },
            { label: "Aéré", value: -1 },
            { label: "Équilibré ⚖️", value: 0 },
            { label: "Dense", value: 1 },
            { label: "Très dense", value: 2 },
          ]}
        />
        <CheckBoxesCategory
          name="average_chocolate_disposition"
          title="🍫 Disposition du chocolat"
          values={[
            { label: "Superposé", value: -2 },
            { label: "Collé côte à côte", value: -1 },
            { label: "Bien distribué ⚖️", value: 0 },
            { label: "Un peu trop loin", value: 1 },
            { label: "Sur les bords", value: 2 },
          ]}
        />
        <CheckBoxesCategory
          name="average_big_or_small"
          title="🤏 Petit ou gros"
          values={[
            { label: "Très petit", value: -2 },
            { label: "Petit", value: -1 },
            { label: "Équilibré ⚖️", value: 0 },
            { label: "gros", value: 1 },
            { label: "Très gros", value: 2 },
          ]}
        />
      </Form>
    </details>
  );
}

function CheckBoxesCategory({
  title,
  name,
  values,
}: {
  title: string;
  name: string;
  values: Array<{ label: string; value: number }>;
}) {
  const [searchParams] = useSearchParams();
  const checkedParams = searchParams.getAll(name);
  return (
    <details className="w-full pb-1 open:border-b open:border-[#FFBB01] open:border-opacity-50">
      <summary className="text-sm text-gray-900">
        {title} {checkedParams.length > 0 ? `(${checkedParams.length})` : ""}
      </summary>
      <div className="ml-6 divide-y divide-[#FFBB01] divide-opacity-20">
        {values.map(({ label, value }) => (
          <label key={label + value} className="relative flex items-start py-2">
            <div className="min-w-0 flex-1 text-sm leading-6">
              <span className="select-none text-gray-700">{label}</span>
            </div>
            <div className="ml-3 flex h-6 items-center">
              <input
                name={name}
                value={value}
                type="checkbox"
                defaultChecked={checkedParams.includes(String(value))}
                className="h-4 w-4 rounded border-gray-300 text-[#FFBB01] focus:ring-[#FFBB01]"
              />
            </div>
          </label>
        ))}
      </div>
    </details>
  );
}
