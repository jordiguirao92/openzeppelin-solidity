const { assertRevert } = require('./helpers/assertRevert');
const { ethGetBalance } = require('./helpers/web3');

var LimitBalanceMock = artifacts.require('LimitBalanceMock');

contract('LimitBalance', function (accounts) {
  let lb;

  beforeEach(async function () {
    lb = await LimitBalanceMock.new();
  });

  let LIMIT = 1000;

  it('should expose limit', async function () {
    let limit = await lb.limit();
    assert.equal(limit, LIMIT);
  });

  it('should allow sending below limit', async function () {
    let amount = 1;
    await lb.limitedDeposit({ value: amount });

    const balance = await ethGetBalance(lb.address);
    assert.equal(balance, amount);
  });

  it('shouldnt allow sending above limit', async function () {
    let amount = 1110;
    await assertRevert(lb.limitedDeposit({ value: amount }));
  });

  it('should allow multiple sends below limit', async function () {
    let amount = 500;
    await lb.limitedDeposit({ value: amount });

    const balance = await ethGetBalance(lb.address);
    assert.equal(balance, amount);

    await lb.limitedDeposit({ value: amount });
    const updatedBalance = await ethGetBalance(lb.address);
    assert.equal(updatedBalance, amount * 2);
  });

  it('shouldnt allow multiple sends above limit', async function () {
    let amount = 500;
    await lb.limitedDeposit({ value: amount });

    const balance = await ethGetBalance(lb.address);
    assert.equal(balance, amount);
    await assertRevert(lb.limitedDeposit({ value: amount + 1 }));
  });
});
