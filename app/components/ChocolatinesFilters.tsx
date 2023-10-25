import {
  Form,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";

export default function ChocolatinesFilters() {
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const { geojson } = useLoaderData();
  const total = Array.from(searchParams).length;

  const filteredGeojson = geojson?.features?.filter(
    (feature) => !!feature.properties.is_included_by_filters,
  )?.length;

  return (
    <details className="border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2">
      <summary className="font-bold">
        Filters {total > 0 ? `(${total})` : "👀 "}{" "}
        {total > 0 ? (
          <small className="font-normal opacity-25">
            {" "}
            - {filteredGeojson} shops
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
          title="⏱️ Opened now"
          name="opened_now"
          values={[
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ]}
        />
        <CheckBoxesCategory
          title="🧑‍🍳 Homemade"
          name="homemade"
          values={[
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ]}
        />
        <CheckBoxesCategory
          title="🏷️ Price"
          name="price"
          values={[
            { label: "Less than 1€", value: 1 },
            { label: "1€ to 2€", value: 2 },
            { label: "2€ to 3€", value: 3 },
            { label: "More than 3€", value: 4 },
          ]}
        />
        <CheckBoxesCategory
          name="buttery"
          title="🧈 Buttery"
          values={[
            { label: "Not at all", value: -2 },
            { label: "Not much", value: -1 },
            { label: "Balanced ⚖️", value: 0 },
            { label: "A lot", value: 1 },
            { label: "Anything but butter", value: 2 },
          ]}
        />
        <CheckBoxesCategory
          name="flaky_or_brioche"
          title="🔪 Flaky/Feuilleuté or Brioche-like"
          values={[
            { label: "Very flaky", value: -2 },
            { label: "Flaky", value: -1 },
            { label: "Balanced ⚖️", value: 0 },
            { label: "Brioche", value: 1 },
            { label: "Very brioche", value: 2 },
          ]}
        />
        <CheckBoxesCategory
          name="golden_or_pale"
          title="👑 Golden or Pale"
          values={[
            { label: "Very golden", value: -2 },
            { label: "Golden", value: -1 },
            { label: "Balanced ⚖️", value: 0 },
            { label: "Pale", value: 1 },
            { label: "Very pale", value: 2 },
          ]}
        />
        <CheckBoxesCategory
          name="crispy_or_soft"
          title="🍦 Crispy or Soft"
          values={[
            { label: "Very crispy", value: -2 },
            { label: "Crispy", value: -1 },
            { label: "Balanced ⚖️", value: 0 },
            { label: "Soft", value: 1 },
            { label: "Very soft", value: 2 },
          ]}
        />
        <CheckBoxesCategory
          name="light_or_dense"
          title="🧱 Light or Dense"
          values={[
            { label: "Very light", value: -2 },
            { label: "Light", value: -1 },
            { label: "Balanced ⚖️", value: 0 },
            { label: "Dense", value: 1 },
            { label: "Very dense", value: 2 },
          ]}
        />
        <CheckBoxesCategory
          name="chocolate_disposition"
          title="🍫 Chocolate Disposition"
          values={[
            { label: "Superimposed", value: -2 },
            { label: "Stuck side by side", value: -1 },
            { label: "Well-distributed ⚖️", value: 0 },
            { label: "Too far away", value: 1 },
            { label: "On the edges", value: 2 },
          ]}
        />
        <CheckBoxesCategory
          name="big_or_small"
          title="🤏 Big or Small"
          values={[
            { label: "Very small", value: -2 },
            { label: "Small", value: -1 },
            { label: "Balanced ⚖️", value: 0 },
            { label: "Big", value: 1 },
            { label: "Very big", value: 2 },
          ]}
        />
        <CheckBoxesCategory
          name="good_or_not_good"
          title="🤩 Good or Not Good"
          values={[
            { label: "Very bad", value: -2 },
            { label: "Bad", value: -1 },
            { label: "OK", value: 0 },
            { label: "Good", value: 1 },
            { label: "Very good", value: 2 },
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
