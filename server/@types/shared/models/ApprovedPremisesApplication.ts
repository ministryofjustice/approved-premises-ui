/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AnyValue } from './AnyValue';
import type { Application } from './Application';
import type { PersonRisks } from './PersonRisks';

export type ApprovedPremisesApplication = (Application & {
    isWomensApplication?: boolean;
    isPipeApplication?: boolean;
    risks?: PersonRisks;
    createdByUserId: string;
    schemaVersion: string;
    outdatedSchema: boolean;
    data?: AnyValue;
    document?: AnyValue;
});

