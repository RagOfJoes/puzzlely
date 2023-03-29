import { useEffect, useLayoutEffect } from "react";

const useSafeLayoutEffect = globalThis?.document ? useLayoutEffect : useEffect;

export default useSafeLayoutEffect;
