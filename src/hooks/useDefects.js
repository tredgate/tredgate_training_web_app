import { useState, useCallback } from "react";
import {
  getDefects,
  createDefect,
  resolveDefect,
  resetDefects,
} from "../data/defects";

export function useDefects() {
  const [defects, setDefects] = useState(() => getDefects());

  const addDefect = useCallback((defect) => {
    createDefect(defect);
    setDefects(getDefects());
  }, []);

  const removeDefect = useCallback((id) => {
    resolveDefect(id);
    setDefects(getDefects());
  }, []);

  const reset = useCallback(() => {
    const fresh = resetDefects();
    setDefects(fresh);
  }, []);

  return { defects, addDefect, removeDefect, reset };
}
