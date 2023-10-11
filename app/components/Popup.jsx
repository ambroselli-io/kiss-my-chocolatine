const Popup = ({ title = "Petit Gâteau", address = "Harleemerstraat 35D, 1011KW Amsterdam" }) => (
  <div className="flex items-center py-3 px-4 rounded-2xl w-full">
    <svg
      width="2rem"
      height="2rem"
      viewBox="0 0 32 32"
      fill="none"
      className="flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.40005 6.40001C6.40005 5.55132 6.73719 4.73739 7.33731 4.13727C7.93742 3.53715 8.75136 3.20001 9.60005 3.20001H22.4001C23.2487 3.20001 24.0627 3.53715 24.6628 4.13727C25.2629 4.73739 25.6 5.55132 25.6 6.40001V25.6C26.0244 25.6 26.4314 25.7686 26.7314 26.0686C27.0315 26.3687 27.2001 26.7757 27.2001 27.2C27.2001 27.6244 27.0315 28.0313 26.7314 28.3314C26.4314 28.6314 26.0244 28.8 25.6 28.8H20.8001C20.3757 28.8 19.9687 28.6314 19.6687 28.3314C19.3686 28.0313 19.2001 27.6244 19.2001 27.2V24C19.2001 23.5757 19.0315 23.1687 18.7314 22.8686C18.4314 22.5686 18.0244 22.4 17.6 22.4H14.4C13.9757 22.4 13.5687 22.5686 13.2687 22.8686C12.9686 23.1687 12.8 23.5757 12.8 24V27.2C12.8 27.6244 12.6315 28.0313 12.3314 28.3314C12.0314 28.6314 11.6244 28.8 11.2 28.8H6.40005C5.9757 28.8 5.56874 28.6314 5.26868 28.3314C4.96862 28.0313 4.80005 27.6244 4.80005 27.2C4.80005 26.7757 4.96862 26.3687 5.26868 26.0686C5.56874 25.7686 5.9757 25.6 6.40005 25.6V6.40001ZM11.2 8.00001H14.4V11.2H11.2V8.00001ZM14.4 14.4H11.2V17.6H14.4V14.4ZM17.6 8.00001H20.8001V11.2H17.6V8.00001ZM20.8001 14.4H17.6V17.6H20.8001V14.4Z"
        fill="#FFBB01"
      />
    </svg>
    <div className="flex flex-col ml-3 items-start justify-start flex-shrink overflow-hidden">
      <span className="font-bold w-full text-left text-base">{title}</span>
      <span className="text-ellipsis overflow-hidden whitespace-nowrap w-full text-left text-sm">
        {address}
      </span>
    </div>
  </div>
);

export default Popup;
