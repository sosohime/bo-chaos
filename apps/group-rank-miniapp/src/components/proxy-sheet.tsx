import { ActionButton, LoadStatus } from "./async-feedback";
import BottomSheet, { SheetInput } from "./bottom-sheet";
import { useEffect, useRef, useState } from "react";
import { Button, Picker, Text, View } from "@tarojs/components";
import Taro, { useDidHide } from "@tarojs/taro";
import type { GroupRankEntryDto, GroupRankTemplate } from "@mono/types";
import { currentGroupGeneration, groupApi, newRequestId } from "../lib/api";
import { singleRecord } from "../lib/record-policy";
import { formatSubmittedAt } from "../lib/format";
import Avatar from "./avatar";
import "./proxy.scss";

export interface ProxyParticipant {
  id: string;
  displayName: string;
  claimantUserId?: string | null;
  claimantName?: string | null;
}

export default function ProxySheet({
  boardId,
  participants,
  initialId = "",
  template,
  writable,
  onClose,
  onChanged,
}: {
  boardId: string;
  participants: ProxyParticipant[];
  initialId?: string;
  template: GroupRankTemplate;
  writable: boolean;
  onClose: () => void;
  onChanged: () => void | Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState(initialId);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [entries, setEntries] = useState<GroupRankEntryDto[]>([]);
  const [editing, setEditing] = useState<GroupRankEntryDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [workingLabel, setWorkingLabel] = useState("保存中…");
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyReadyFor, setHistoryReadyFor] = useState("");
  const active = useRef(true);
  const intent = useRef(0);
  const readSequence = useRef(0);
  const lock = useRef(false);
  const pending = useRef<{ key: string; requestId: string } | null>(null);
  const selected = participants.find((person) => person.id === selectedId);
  const waitingForOriginal = template.entryMode === "single" && !!selectedId && historyReadyFor !== selectedId;
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      intent.current += 1;
      readSequence.current += 1;
    };
  }, []);
  useDidHide(() => {
    intent.current += 1;
    readSequence.current += 1;
  });
  async function loadEntries() {
    const current = ++readSequence.current;
    setEntries([]);
    setHistoryError("");
    setHistoryReadyFor("");
    if (!selectedId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rows = await groupApi.proxyEntries(boardId, selectedId);
      if (active.current && current === readSequence.current) {
        setEntries(rows);
        if (template.entryMode === "single") {
          const original = singleRecord(template, rows);
          setEditing(original);
          setValue(original?.value || "");
        }
        setHistoryReadyFor(selectedId);
      }
    } catch (reason) {
      if (active.current && current === readSequence.current)
        setHistoryError(
          reason instanceof Error ? reason.message : "记录加载失败，请重试",
        );
    } finally {
      if (active.current && current === readSequence.current) setLoading(false);
    }
  }
  useEffect(() => {
    void loadEntries();
  }, [selectedId, boardId]);
  function choose(participantId: string) {
    if (lock.current) return;
    readSequence.current += 1;
    intent.current += 1;
    setSelectedId(participantId);
    if (!participantId) setName("");
    setEditing(null);
    setValue("");
    setError("");
    setNameError("");
    setHistoryOpen(false);
  }
  async function run(operation: () => Promise<unknown>, label = "保存中…") {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setWorkingLabel(label);
    setError("");
    const current = ++intent.current;
    const generation = currentGroupGeneration();
    const isCurrent = () =>
      active.current &&
      current === intent.current &&
      generation === currentGroupGeneration();
    try {
      await operation();
      if (isCurrent()) {
        pending.current = null;
        await onChanged();
      }
    } catch (reason) {
      if (isCurrent())
        setError(reason instanceof Error ? reason.message : "操作失败，请重试");
    } finally {
      lock.current = false;
      if (isCurrent()) setBusy(false);
    }
  }
  function save() {
    if (!writable || lock.current || waitingForOriginal) return;
    if (!selectedId && !name.trim()) {
      setNameError("先填写群友的名字");
      return;
    }
    if (!value.trim()) {
      setError("先填写成绩");
      return;
    }
    if (selectedId && !selected) {
      setError("这个名字已不能代填，请关闭后重新打开榜单。");
      return;
    }
    if (editing) {
      void run(() =>
        groupApi.proxyEdit(boardId, editing.id, value.trim(), editing.revision),
      );
      return;
    }
    const target = selectedId
      ? { participantId: selectedId }
      : { name: name.trim() };
    const key = JSON.stringify({ ...target, value: value.trim() });
    if (pending.current?.key !== key)
      pending.current = { key, requestId: newRequestId() };
    const requestId = pending.current.requestId;
    void run(() =>
      groupApi.proxySubmit(boardId, {
        ...target,
        value: value.trim(),
        requestId,
      }),
    );
  }
  async function remove(entry: GroupRankEntryDto) {
    if (lock.current) return;
    const current = intent.current,
      generation = currentGroupGeneration();
    const result = await Taro.showModal({
      title: "删除这条代填成绩？",
      content: "删除后会重新计算排名，此操作无法撤销。",
      confirmText: "删除",
    });
    if (
      result.confirm &&
      active.current &&
      current === intent.current &&
      generation === currentGroupGeneration()
    )
      void run(() => groupApi.proxyRemove(boardId, entry.id), "正在删除…");
  }
  return (
    <BottomSheet className="proxy-sheet" header={
        <View className="profile-heading">
          <Text className="section-title">{selectedId ? "代填记录" : "帮群友记"}</Text>
          <Button className="text-action" disabled={busy} onClick={onClose}>
            关闭
          </Button>
        </View>
      } footer={<>
        {!writable && <Text className="entry-note">榜单已暂停或结束，暂时不能代填或修改成绩。</Text>}
        <ActionButton className="action" disabled={busy || !writable || waitingForOriginal} loading={busy} pendingLabel={workingLabel} onClick={save}>
          {busy ? "保存中…" : editing ? "保存修改" : "保存成绩"}
        </ActionButton>
        {editing && <Button className="text-action" disabled={busy} onClick={() => { if (template.entryMode === "single") onClose(); else { setEditing(null); setValue(""); setError(""); } }}>取消修改</Button>}
      </>}>
        {selectedId ? (<>
          <Text className="entry-label">记给谁</Text>
          <View className="entry-person proxy-person">
            <Avatar userId={`proxy:${selectedId}`} name={selected?.displayName || "群友"} />
            <Text className="entry-person-name">{selected?.displayName || "这个名字已不可代填"}</Text>
            <Button className="text-action" disabled={busy} onClick={() => choose("")}>换个人</Button>
          </View></>
        ) : (
          <View className="entry-field">
            <Text className="entry-label">记给谁</Text>
            <SheetInput
              className="entry-control"
              type="text"
              value={name}
              maxlength={24}
              disabled={busy}
              placeholder="群友的名字"
              onInput={(event) => {
                if (!lock.current) { setName(event.detail.value); setNameError(""); }
              }}
            />
            {nameError && <Text className="entry-error">{nameError}</Text>}
          </View>
        )}
        {!selectedId && participants.length > 0 && (
          <View className="entry-choose">
            {participants.length === 1 ? (
              <Button className="text-action" disabled={busy} onClick={() => choose(participants[0].id)}>
                继续给{participants[0].displayName}记
              </Button>
            ) : (
              <Picker
                mode="selector"
                range={participants.map((person) => person.displayName)}
                disabled={busy}
                onChange={(event) => {
                  const person = participants[Number(event.detail.value)];
                  if (person) choose(person.id);
                }}
              >
                <Button className="text-action" disabled={busy}>从已登记名字选择</Button>
              </Picker>
            )}
          </View>
        )}
        <View className="entry-field score-entry">
          <Text className="entry-label">{editing ? "修改成绩" : "成绩"}</Text>
          <View className={`entry-value ${value.trim().length > 9 ? "entry-value-long" : ""}`}>
            <SheetInput
              type="digit"
              value={value}
              maxlength={13}
              disabled={busy || !writable || waitingForOriginal}
              placeholder="填写代填成绩"
              placeholderClass="entry-placeholder"
              onInput={(event) => {
                if (!lock.current) { setValue(event.detail.value); setError(""); }
              }}
            />
            {template.unit && <Text className="entry-unit">{template.unit}</Text>}
          </View>
          {error && <Text className="entry-error">{error}</Text>}
        </View>
        {selectedId && (
          <View className="proxy-history">
            <Button className="proxy-history-toggle" ariaLabel={historyOpen ? "收起代填历史" : "展开代填历史"} onClick={() => setHistoryOpen(!historyOpen)}><Text>代填历史</Text><Text>{historyOpen ? "⌄" : "›"}</Text></Button>
            {(historyOpen || waitingForOriginal) && <>
            {loading && <LoadStatus label="正在加载记录" compact />}
            {historyError && (
              <View>
                <Text className="profile-error">{historyError}</Text>
                <Button className="text-action" onClick={loadEntries}>
                  重新加载
                </Button>
              </View>
            )}
            {historyOpen && !loading && !historyError && !entries.length && (
              <Text className="description">还没有记录。</Text>
            )}
            {historyOpen && entries.map((entry) => (
              <View className="proxy-history-row" key={entry.id}>
                <View>
                  <Text className="proxy-value">
                    {entry.value} {template.unit}
                  </Text>
                  <Text className="note">
                    {formatSubmittedAt(entry.createdAt)} · 创建者代填
                  </Text>
                </View>
                <View className="proxy-history-actions">
                  <Button
                    className="text-action"
                    disabled={busy || !writable}
                    onClick={() => {
                      setEditing(entry);
                      setValue(entry.value);
                      setError("");
                    }}
                  >
                    修改
                  </Button>
                  <Button
                    className="text-action"
                    disabled={busy}
                    onClick={() => remove(entry)}
                  >
                    删除
                  </Button>
                </View>
              </View>
            ))}</>}
          </View>
        )}
    </BottomSheet>
  );
}
