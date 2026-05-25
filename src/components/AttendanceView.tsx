import React, { useState, useEffect } from "react";
import { ClipboardCheck, Sparkles, TrendingUp, ShieldAlert, CheckCircle2, QrCode, Loader2 } from "lucide-react";
import { StudentProfile } from "../types";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { fetchAttendanceFromSupabase, recordAttendanceInSupabase } from "../lib/supabaseSync";

interface AttendanceLog {
  date: string;
  topic: string;
  mentor: string;
  status: "Present" | "Excused" | "Absent";
}

interface AttendanceViewProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
}

export default function AttendanceView({ userProfile, onGrantXp }: AttendanceViewProps) {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [totalXpGranted, setTotalXpGranted] = useState(0);
  const [dbLoading, setDbLoading] = useState(false);

  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceLog[]>([
    { date: "May 22, 2026", topic: "Intro to databases & primary tags", mentor: "Mr. Ronald Mwebesa", status: "Present" },
    { date: "May 15, 2026", topic: "Dynamic CSS Alignment structures", mentor: "Jerome Maku (S5)", status: "Present" },
    { date: "May 08, 2026", topic: "Excel calculation formulas standard and conditional", mentor: "Mr. Ronald Mwebesa", status: "Present" },
    { date: "May 01, 2026", topic: "HTML Semantic elements layout hierarchy", mentor: "Kyobe Arthur (S6)", status: "Excused" }
  ]);

  useEffect(() => {
    async function loadAttendance() {
      if (!isSupabaseConfigured) return;
      setDbLoading(true);
      const data = await fetchAttendanceFromSupabase(userProfile.name);
      if (data && data.length > 0) {
        setAttendanceHistory(data);
        const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
        const alreadyCheckedIn = data.some(log => log.date === todayStr);
        if (alreadyCheckedIn) {
          setHasCheckedIn(true);
        }
      }
      setDbLoading(false);
    }
    loadAttendance();
  }, [userProfile.name]);

  const handleSelfCheckin = async () => {
    if (hasCheckedIn) return;

    const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const newLog: AttendanceLog = {
      date: todayStr,
      topic: "Active laboratories logic proximity check-in",
      mentor: "Mr. Ronald Mwebesa",
      status: "Present"
    };

    setHasCheckedIn(true);
    setAttendanceHistory([newLog, ...attendanceHistory]);
    onGrantXp(15, "Checked in today's active laboratory session!");
    setTotalXpGranted(15);

    if (isSupabaseConfigured) {
      await recordAttendanceInSupabase({
        student_name: userProfile.name,
        date: newLog.date,
        topic: newLog.topic,
        mentor: newLog.mentor,
        status: newLog.status
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header alert indicator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-sans font-semibold text-slate-100 text-sm">Attendance Recording Terminal</h3>
          </div>
          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
            <span>Simulate a high-school smart proximity scanner registers. Verify your student session records.</span>
            {dbLoading && <Loader2 className="w-3 h-3 text-pink-400 animate-spin" />}
          </p>
        </div>

        <button
          onClick={handleSelfCheckin}
          disabled={hasCheckedIn}
          className={`px-4 py-2.5 rounded-xl text-xs font-sans font-semibold flex items-center gap-1.5 transition-all shadow-md shrink-0 ${
            hasCheckedIn
              ? "bg-slate-950 border border-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-slate-100"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>{hasCheckedIn ? "Checked In Today" : "Mark Today Proximity Check-In"}</span>
        </button>
      </div>

      {hasCheckedIn && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/35 rounded-xl text-xs text-emerald-200 animate-fadeIn flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">VERIFICATION OK</span>
            <p className="mt-0.5 text-slate-300">Proximity coordinates recognized. Successfully recorded as PRESENT! +15 XP points awarded to your title indexes.</p>
          </div>
        </div>
      )}

      {/* Stats Summary Rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Overall Attendance Rate</span>
            <p className="text-xl sm:text-2xl font-bold font-sans text-slate-100 mt-1">94.5 %</p>
          </div>
          <TrendingUp className="w-8 h-8 text-emerald-400/80 bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/15" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Active Days Count</span>
            <p className="text-xl sm:text-2xl font-bold font-sans text-slate-100 mt-1">18 / 20 days</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-indigo-400 bg-indigo-505/10 p-1.5 rounded-lg border border-indigo-505/15" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Next Mandatory Session</span>
            <p className="text-sm font-bold font-sans text-slate-250 mt-1.5">Friday, 2:00 PM</p>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase py-1 px-2.5 rounded-md bg-rose-600/10 text-rose-455 border border-rose-500/10 shrink-0 select-none">3 days left</span>
        </div>
      </div>

      {/* Interactive Logs Tables */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3.5 select-none font-sans">
          <span className="text-xs font-bold text-slate-200">LATEST VERIFIED ATTENDANCE REGISTERS</span>
          <span className="text-[10px] uppercase font-mono bg-slate-950 text-indigo-400 border border-slate-800 px-2.5 py-0.5 rounded-md font-bold">STAHIZZA-T2</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="text-[10px] uppercase text-slate-500 font-mono border-b border-slate-850">
                <th className="pb-2.5 font-medium">Date</th>
                <th className="pb-2.5 font-medium">Assigned Lab Topic Details</th>
                <th className="pb-2.5 font-medium">Verifying Patron / Mentor</th>
                <th className="pb-2.5 font-medium text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/50 text-slate-300">
              {attendanceHistory.map((log, index) => (
                <tr key={index} className="hover:bg-slate-950/20 transition-all select-text">
                  <td className="py-3 font-mono text-[10px] whitespace-nowrap">{log.date}</td>
                  <td className="py-3 font-medium select-text">{log.topic}</td>
                  <td className="py-3 text-slate-400 whitespace-nowrap">{log.mentor}</td>
                  <td className="py-3 text-right whitespace-nowrap select-none">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                      log.status === "Present" ? "bg-emerald-500/15 text-emerald-400" :
                      log.status === "Excused" ? "bg-indigo-505/10 text-indigo-400" :
                      "bg-rose-500/10 text-rose-400"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-850 flex items-center gap-2.5 text-[11px] font-sans text-slate-450 select-none leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
          <p>Important Notice: Attendance registers can only be modified by standard registered Patron accounts inside laboratory terminal workstations.</p>
        </div>
      </div>
    </div>
  );
}
