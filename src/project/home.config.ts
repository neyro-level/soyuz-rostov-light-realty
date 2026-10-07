import { homeContent as altHomeContent } from "../../fixtures/fixture-alt/project/home.config";
import { isAltFixture } from "./data.config";
import { homeContent as souzHomeContent } from "./home.souz.config";

export const homeContent = isAltFixture() ? altHomeContent : souzHomeContent;
