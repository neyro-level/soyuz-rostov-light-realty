import { site as altSite } from "../../fixtures/fixture-alt/project/site.config";
import { isAltFixture } from "./data.config";
import { site as souzSite } from "./site.souz.config";

export const site = isAltFixture() ? altSite : souzSite;
