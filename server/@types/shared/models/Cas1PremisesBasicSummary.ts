/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NamedId } from './NamedId';
export type Cas1PremisesBasicSummary = {
    id: string;
    name: string;
    apCode?: string;
    apArea: NamedId;
    bedCount: number;
    supportsSpaceBookings: boolean;
    /**
     * Full address, excluding postcode
     */
    fullAddress: string;
    postcode: string;
};

