const Tabs = ({ menu, children, activeTab, setActiveTab, className = "" }) => {
  const onTabClick = (e) => setActiveTab(Number(e.target.dataset.index));

  return (
    <section className={`tabs ${className}`}>
      <nav
        aria-labelledby="primary-navigation"
        className="flex h-10 border-b border-gray-200 w-full">
        {menu.map((item, index) => (
          <ul
            data-index={index}
            key={item}
            className={`${
              activeTab === index ? "active" : ""
            } grow shrink-0 order-${index} flex justify-center items-center cursor-pointer`}
            onClick={onTabClick}>
            {item}
          </ul>
        ))}
      </nav>
      <figure aria-labelledby="tab indicator" className="flex h-0.5 -mt-0.5">
        {menu.map((_, index) => (
          <figurecaption
            key={index}
            style={{
              transform: index === 0 ? `translateX(${activeTab * 100}%)` : null,
            }}
            className={`${index === 0 ? "bg-[#FFBB01] transition-transform" : ""} h-full grow`}
          />
        ))}
      </figure>
      {children}
    </section>
  );
};

export default Tabs;
