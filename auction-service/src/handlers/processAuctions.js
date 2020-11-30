import createError from 'http-errors';
import { getEndedAuctions } from '../lib/getEndedAuctions';
import { closeAuction } from '../lib/closeAuction';

async function processAuctions(event, context) {
  try {
    // identify and get all the auctions to close
    const auctionsToClose = await getEndedAuctions();
    // closing all the auctions at once or in parallel using Promises.all
    const closePromises = auctionsToClose.map((auction) => closeAuction(auction));
    await Promise.all(closePromises);
    return { closed: closePromises.length };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = processAuctions;
