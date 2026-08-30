import type { Assumptions } from "../types";
import { moneyExact } from "../lib/format";
import { TERM_HELP } from "../lib/glossary";
import { goldenRule } from "../lib/subTaxes";
import { Hint } from "./Hint";

type Props = {
  assumptions: Assumptions;
  auctionDay: number;
  reserve: number;
  annualBill: number;
  firstBillMonth: number;
  billsDuringHold: number;
  deskCash?: number;
  compact?: boolean;
};

export function GoldenRule({
  assumptions,
  auctionDay,
  reserve,
  annualBill,
  firstBillMonth,
  billsDuringHold,
  deskCash,
  compact,
}: Props) {
  const rule = deskCash != null ? goldenRule(deskCash, auctionDay, reserve) : null;
  const fail = rule ? !rule.pass : false;

  return (
    <section className={fail ? "golden-banner fail" : "golden-banner"}>
      <h3>
        <Hint entry={TERM_HELP.goldenRule}>Golden rule of sub-taxes</Hint>
      </h3>
      <p className="owner">
        Never buy unless 2× to 3× the annual property-tax bill is already sitting in cash after
        auction ACH. If that levy posts and you miss it, the county sells a new lien. The new
        investor primes you and the original stake can go to zero.
      </p>
      <div className="metrics">
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.subTaxBill}>Next levy</Hint></div>
          <div className="metric-value">{moneyExact(annualBill)}</div>
        </div>
        <div className="metric">
          <div className="field-label">First bill</div>
          <div className="metric-value">Mo {firstBillMonth}</div>
        </div>
        <div className="metric">
          <div className="field-label">Reserve multiple</div>
          <div className="metric-value">{assumptions.subTaxReserveMultiple.toFixed(1)}×</div>
        </div>
        <div className="metric">
          <div className="field-label">Bills in hold</div>
          <div className="metric-value">{billsDuringHold}</div>
        </div>
        <div className="metric">
          <div className="field-label"><Hint entry={TERM_HELP.subTaxReserve}>Must reserve</Hint></div>
          <div className="metric-value">{moneyExact(reserve)}</div>
        </div>
        <div className="metric">
          <div className="field-label">Auction ACH</div>
          <div className="metric-value">{moneyExact(auctionDay)}</div>
        </div>
        <div className="metric">
          <div className="field-label">Cash to own</div>
          <div className="metric-value">{moneyExact(auctionDay + reserve)}</div>
        </div>
      </div>
      {rule ? (
        <p className="owner" style={{ marginTop: 10 }}>
          {rule.pass
            ? `Desk cash ${moneyExact(rule.deskCash)} covers ACH plus the reserve. ${moneyExact(Math.max(0, rule.free))} stays free.`
            : `Desk cash ${moneyExact(rule.deskCash)} is short ${moneyExact(rule.shortfall)}. Do not bid — a missed levy primes this certificate.`}
        </p>
      ) : null}
      {compact ? null : (
        <p className="owner">
          Reserve is the greater of {assumptions.subTaxReserveMultiple.toFixed(1)}× the annual levy
          ({(assumptions.subsequentTaxRate * 100).toFixed(2)}% of SDAT assessed) or the bills that
          drop during the hold. Paying the bill adds it to the certificate and it earns statutory
          interest. Not paying it is how the position is lost.
        </p>
      )}
    </section>
  );
}
