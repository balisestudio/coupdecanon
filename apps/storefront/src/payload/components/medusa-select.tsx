"use client";

import { SelectInput, useConfig, useField } from "@payloadcms/ui";
import type { OptionObject, TextFieldClientProps, Validate } from "payload";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MedusaOption, MedusaResource } from "../medusa";

type Value = string | string[] | null | undefined;

const PLACEHOLDERS = {
  loading: "Chargement de la boutique…",
  failed: "La boutique ne répond pas : réessayez dans un instant.",
  ready: "Choisir…",
} as const;

/**
 * A text field the team fills from Medusa's catalog: a select of the shop's products, or of
 * its families, by name. It stores their Medusa ids, in the order chosen when it takes several.
 * An id Medusa no longer knows stays visible, so the team can take it out.
 */
export function MedusaSelect(props: TextFieldClientProps & { resource: MedusaResource }) {
  const { field, path: pathFromProps, readOnly, resource, validate } = props;
  const { admin, hasMany = false, label, name, required } = field;
  const { config } = useConfig();
  const [options, setOptions] = useState<MedusaOption[]>([]);
  const [status, setStatus] = useState<keyof typeof PLACEHOLDERS>("loading");

  const memoizedValidate = useCallback<Validate>(
    (value, options) =>
      typeof validate === "function"
        ? validate(value, { ...options, hasMany, required } as never)
        : true,
    [validate, hasMany, required],
  );
  const {
    customComponents: { AfterInput, BeforeInput, Description, Error: FieldError, Label } = {},
    disabled,
    path,
    setValue,
    showError,
    value,
  } = useField<Value>({ potentiallyStalePath: pathFromProps, validate: memoizedValidate });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${config.serverURL}${config.routes.api}/medusa/${resource}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const body = (await response.json()) as { options: MedusaOption[] };
        setOptions(body.options);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("failed");
      });
    return () => controller.abort();
  }, [config.serverURL, config.routes.api, resource]);

  // The ids chosen that the list lacks, under a name that says so.
  const allOptions = useMemo<OptionObject[]>(() => {
    const chosen = Array.isArray(value) ? value : value ? [value] : [];
    const known = new Set(options.map((option) => option.value));
    const missing = chosen
      .filter((id) => !known.has(id))
      .map((id) => ({
        value: id,
        label: status === "ready" ? `Introuvable dans la boutique (${id})` : id,
      }));
    return [...options, ...missing];
  }, [options, value, status]);

  const onChange = useCallback(
    (selected: unknown) => {
      if (readOnly || disabled) return;
      const values = (Array.isArray(selected) ? selected : selected ? [selected] : []).map(
        (option) => (option as OptionObject).value,
      );
      setValue(hasMany ? values : (values[0] ?? null));
    },
    [readOnly, disabled, hasMany, setValue],
  );

  return (
    <SelectInput
      AfterInput={AfterInput}
      BeforeInput={BeforeInput}
      Description={Description}
      description={admin?.description}
      Error={FieldError}
      hasMany={hasMany}
      isClearable={!required}
      isSortable={hasMany}
      Label={Label}
      label={label}
      name={name}
      onChange={onChange}
      options={allOptions}
      path={path}
      placeholder={PLACEHOLDERS[status]}
      readOnly={readOnly || disabled}
      required={required}
      showError={showError}
      value={value ?? (hasMany ? [] : undefined)}
    />
  );
}
