import React from "react";
import { useCombobox } from "downshift";

export default function AutoCompleteInput({
  items: initItems,
  label,
  required,
  ...props
}) {
  function getValueFiltered(inputValue) {
    const lowerCasedInputValue = inputValue.toLowerCase();

    return function valueFiler(value) {
      return !inputValue || value.toLowerCase().includes(lowerCasedInputValue);
    };
  }

  function ComboBox() {
    const [items, setItems] = React.useState(() =>
      initItems.map((value) => ({ id: value, value })),
    );
    const {
      isOpen,
      getToggleButtonProps,
      getLabelProps,
      getMenuProps,
      getInputProps,
      highlightedIndex,
      getItemProps,
      selectedItem,
    } = useCombobox({
      onInputValueChange({ inputValue }) {
        setItems(
          initItems
            .filter(getValueFiltered(inputValue))
            .map((value) => ({ id: value, value })),
        );
      },
      items,
      itemToString(item) {
        return item ? item.value : "";
      },
    });

    return (
      <div className="w-full max-w-lg">
        <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
          <div className="flex gap-0.5 bg-white shadow-sm">
            <input {...props} {...getInputProps()} />
            <button
              aria-label="toggle menu"
              className="px-2"
              type="button"
              {...getToggleButtonProps()}
            >
              {isOpen ? <>&#8593;</> : <>&#8595;</>}
            </button>
          </div>
          <label className="w-fit" {...getLabelProps()}>
            {label}
            {!!required && <sup className="ml-1 text-red-500">*</sup>}
          </label>
        </div>
        <ul
          className={`absolute z-10 mt-1 max-h-80 w-full overflow-scroll bg-white p-0 shadow-md ${
            !(isOpen && items.length) && "hidden"
          }`}
          {...getMenuProps()}
        >
          {isOpen &&
            items.map((item, index) => {
              return (
                <li
                  className={[
                    highlightedIndex === index && "bg-blue-300",
                    selectedItem === item && "font-bold",
                    "flex flex-col px-3 py-2 shadow-sm",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={item.id}
                  {...getItemProps({ item, index })}
                >
                  <span>{item.value}</span>
                </li>
              );
            })}
        </ul>
      </div>
    );
  }
  return <ComboBox />;
}
