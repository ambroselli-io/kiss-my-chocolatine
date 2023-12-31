export default function AboutOneActionOneShare({ allOpen = false }) {
  return (
    <details
      open={allOpen}
      className={[
        "border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2 open:pb-5",
        allOpen
          ? "h-screen overflow-auto [&_summary]:my-10 [&_summary]:font-bold"
          : "",
      ].join(" ")}
    >
      <summary>About one action = one share</summary>
      <div className="mt-2 flex flex-col gap-2 px-2">
        <p>
          We do believe in a model where the end users are earning money. How
          exactly? Here is how -{" "}
          <small>we are building it, please tell us what you think.</small>
        </p>

        <details open={allOpen}>
          <summary>
            The <b>shares of the company</b> are split equally between three
            stakeholders - building team, investors, end users.
          </summary>
          <div className="mt-2 flex flex-col gap-2 px-2">
            <ul className="list-inside list-disc">
              <li>1/3 for the building team</li>
              <li>1/3 for the investors</li>
              <li>1/3 for the end users</li>
            </ul>
            <p>
              It means that when it comes to dividends, it will be split equally
              between those three groups. The powers it brings to each category
              is not the same and needs to be fine tunes, but the idea is
            </p>
            <ul className="list-inside list-disc">
              <li>
                the building team: they have, as a group, veto right{" "}
                <i>a priori</i>
                for anything to be build. You don't force a parent to eat his
                child, do you?
              </li>
              <li>
                the end users: they also have, as a group, a veto right{" "}
                <i>a posteriori</i> on features proposed by the building team.
                You don't support a parent for eating his child, do you? They
                have building team has to ask for their feedbacks and for what
                they wish to see in the app. But the end users have no right on
                who is inside the building teams, who is the investors, what is
                the strategy of the company.
              </li>
              <li>
                the investors: they need to trust the building team and the end
                users regarding features. They have a prerogative on who is
                leading the building team, as always. They have the same{" "}
                <i>a posteriori</i> veto. You don't give money to a parent to
                eat his child, do you?
              </li>
            </ul>
          </div>
        </details>
        <details open={allOpen}>
          <summary>No cap for the shares between the end-users:</summary>
          <div className="mt-2 flex flex-col gap-2 px-2">
            <p>
              there is no cap in the number of shares available, nor the shares
              you can get. The more you have, the more money you'll get out of
              the dividends.
            </p>
          </div>
        </details>
        <details open={allOpen}>
          <summary>To earn a share, you need to either:</summary>
          <div className="mt-2 flex flex-col gap-2 px-2">
            <ul className="list-inside px-4 text-left">
              <li>
                ⏱️{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  Invest one hour of your time in building the platform /
                  marketing.
                </b>{" "}
                For each hour invested, you earn one share, valid two years.
              </li>
              <li>
                💰{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  Invest one euro.
                </b>{" "}
                For each euro invested, you earn one share from the investors
                pool.
              </li>
              <li>
                ✍️{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  Write a review.
                </b>{" "}
                For each review you do, you earn one share from the users pool.
              </li>
              <li>
                💵{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  Add a shop.
                </b>{" "}
                For each shop you add, you earn one share from the users pool.
              </li>
              <li>
                💸{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  Make a referral.
                </b>{" "}
                For each referral you do, you and the new user earn one share
                from the users pool. A referral is either inviting a friend to
                join the app and tell us by email, or like/comment/repost a post
                of ours on social networks
              </li>
              <li>
                🫶{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  Share our social networks content.
                </b>{" "}
                For each like/comment/repost you do, you earn one share from the
                users pool.
              </li>
            </ul>
          </div>
        </details>
      </div>
    </details>
  );
}
