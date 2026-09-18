-- Adds an optional "reward" amount an owner can advertise to finders on the
-- public page. This is a plain display number only — FindBack does not
-- integrate a real payment gateway. The finder-side "보상금 수령 신청" button
-- and the /store checkout flow are both explicitly simulated, front-end-only
-- demo flows with no money movement, so no payout/transaction table exists.

alter table public.items
  add column if not exists reward_amount integer
    check (reward_amount >= 0 and reward_amount <= 10000000);
