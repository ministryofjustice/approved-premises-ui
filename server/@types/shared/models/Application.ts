/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AnyValue } from './AnyValue';
import type { Person } from './Person';

export type Application = {
    id: string;
    person: Person;
    createdByProbationOfficerId: string;
    schemaVersion: string;
    outdatedSchema: boolean;
    createdAt: string;
    isWomensApplication?: boolean;
    isPipeApplication?: boolean;
    submittedAt?: string;
    data?: AnyValue;
    document?: AnyValue;
};

