export default function CompanyStructure() {
  return (
    <details className="open:pb-5">
      <summary className="font-medium underline decoration-[#FFBB01]">
        About one action = one share
      </summary>
      <div className="mt-2 flex flex-col gap-2 px-2">
        <p>
          We do believe a model where all the actors (building team, investors,
          end users) are winning money is possible. We are building it, please
          tell us what you think.{" "}
        </p>

        <details>
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
        <details>
          <summary>
            The repartition of shares between the end-users is the following:
          </summary>
          <div className="mt-2 flex flex-col gap-2 px-2">
            <p>
              there is no cap in the number of shares available, nor the shares
              you can get. The more you have, the more money you'll get out of
              the dividends.
            </p>
          </div>
        </details>
        <details>
          <summary>To earn a share, you need to do either:</summary>
          <div className="mt-2 flex flex-col gap-2 px-2">
            <ul className="list-inside px-4 text-left">
              <li>
                💰{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  A review.
                </b>{" "}
                For each review you do, you earn one share.
              </li>
              <li>
                💵{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  Add a shop.
                </b>{" "}
                For each shop you add, you earn one share.
              </li>
              <li>
                💸{" "}
                <b className="font-medium underline decoration-[#FFBB01]">
                  A referral.
                </b>{" "}
                For each referral you do, you earn one share.
              </li>
            </ul>
          </div>
        </details>
        <details>
          <summary>How do we track this without auth system yet?</summary>
          <div className="mt-2 flex flex-col gap-2 px-2">
            <p>
              By email. A review, adding a new shop or doing a referral is made
              by email. The email is the unique "id" that groups the end user.
              When dividends are paid, you'll need to prove that you are the
              owner of the email by providing an id. An id can't be linked to
              multiple emails. If it's the case, then only one email will be
              able to claim the id. An email without ID can't claim any share.
            </p>
          </div>
        </details>
      </div>
    </details>
  );
}
