type PublicationPlace = Record<string, any> | undefined;

const normalizePublicationPlace = (place?: PublicationPlace) => {
  if (!place) {
    return place;
  }

  const { printing, ...rest } = place;
  return {
    ...rest,
    printingHouse: rest.printingHouse ?? printing,
  };
};

const normalizeWork = (work: Record<string, any>) => {
  if (!work) {
    return work;
  }

  return {
    ...work,
    publicationPlace: normalizePublicationPlace(work.publicationPlace),
    editions: Array.isArray(work.editions)
      ? work.editions.map((edition) => ({
          ...edition,
          publicationPlace: normalizePublicationPlace(edition.publicationPlace),
        }))
      : work.editions,
  };
};

export const normalizeAuthorPayload = (payload: Record<string, any>) => ({
  ...payload,
  works: Array.isArray(payload.works)
    ? payload.works.map((work) => normalizeWork(work))
    : payload.works,
});

export const normalizeAnthologyPayload = (payload: Record<string, any>) => ({
  ...payload,
  publicationPlace: normalizePublicationPlace(payload.publicationPlace),
});

export const normalizeMagazinePayload = (payload: Record<string, any>) => ({
  ...payload,
  publicationPlace: normalizePublicationPlace(payload.publicationPlace),
});

export const normalizeGroupingPayload = (payload: Record<string, any>) => ({
  ...payload,
});

export const normalizePublicationPlaceForPayload = normalizePublicationPlace;
