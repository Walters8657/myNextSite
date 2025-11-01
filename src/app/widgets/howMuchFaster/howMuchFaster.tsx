"use client";

import ToolCard from "../../ui/toolCard/toolCard";
import "./howMuchFaster.scss";
import { useState } from "react";

export default function HowMuchFaster() {
  const rows = Array.from({ length: 4 });
  const columns = ["Speed 1", "Speed 2", "Distance", "Time Saved"];

  // State for table data: 4 rows x 4 columns, all initialized to 0
  const [tableData, setTableData] = useState<number[][]>(
    Array.from({ length: 4 }, () => Array(4).fill(0))
  );

  // Input props for validation
  const inputProps = {
    type: "text",
    inputMode: "decimal" as const,
    pattern: "^\\d*(\\.\\d{0,2})?$",
    maxLength: 8,
    autoComplete: "off",
    className: "input",
  };

  // Handler to update table data
  const handleInputChange = (rowIdx: number, colIdx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and up to 2 decimals
    if (/^\d*(\.\d{0,2})?$/.test(value)) {
      setTableData(prev => {
        const updated = prev.map(row => [...row]);
        updated[rowIdx][colIdx] = value === "" ? 0 : parseFloat(value);
        return updated;
      });
    }
  };

  // Calculate time saved for each row
  const calculatedTableData = tableData.map(row => {
    const [speed1, speed2, distance] = row;
    let timeSaved = 0;
    if (speed1 > 0 && speed2 > 0 && distance > 0) {
      timeSaved = distance * (1 / speed1 - 1 / speed2);
    }
    return [speed1, speed2, distance, timeSaved];
  });

  // Calculate totals
  const totalDistance = calculatedTableData.reduce((sum, row) => sum + row[2], 0);
  const totalTimeSaved = calculatedTableData.reduce((sum, row) => sum + row[3], 0);

  // Helper to format hours as HH:MM:SS with faded leading zeros or fully faded if inputs are missing/zero
  function formatHoursToHMSFaded(hours: number, isEmpty: boolean): JSX.Element {
    if (isEmpty || !isFinite(hours)) return <span className="hms-span-empty">00:00:00</span>;
    const negative = hours < 0;
    const absHours = Math.abs(hours);
    const totalSeconds = Math.round(absHours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const hStr = h.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');
    const timeString =
      hStr === '00' && mStr === '00'
        ? <><span className="faded">00:00:</span>{sStr}</>
        : hStr === '00'
        ? <><span className="faded">00:</span>{mStr}:{sStr}</>
        : <>{hStr}:{mStr}:{sStr}</>;
    return (
      <span className={
        isEmpty ? "hms-span-empty" : negative ? "hms-span-negative" : undefined
      }>
        {negative ? "-" : null}{timeString}
      </span>
    );
  }

  return (
    <ToolCard title="How Much Faster?">
      <div className="howMuchFasterContent">
        <table className="table">
          <thead>
            <tr>
              <th>Speed 1</th>
              <th>Speed 2</th>
              <th>Dist</th>
              <th>ΔTime</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((_, rowIdx) => (
              <tr key={rowIdx} className="data-row">
                {columns.map((_, colIdx) => (
                  <td key={colIdx}>
                    {colIdx === 3 ? (
                      <>
                        <input
                          {...inputProps}
                          readOnly
                          tabIndex={-1}
                          style={{ background: '#f8f8f8' }}
                        />
                        <span className="hms-span">{
                          formatHoursToHMSFaded(
                            calculatedTableData[rowIdx][3],
                            tableData[rowIdx][0] === 0 || tableData[rowIdx][1] === 0 || tableData[rowIdx][2] === 0
                          )
                        }</span>
                      </>
                    ) : (
                      <input
                        {...inputProps}
                        value={tableData[rowIdx][colIdx] === 0 ? "" : tableData[rowIdx][colIdx]}
                        onChange={handleInputChange(rowIdx, colIdx)}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {/* Total row */}
            <tr className="total-row">
              <td colSpan={2} className="totals-label">Totals</td>
              <td>
                <input
                  {...inputProps}
                  readOnly
                  tabIndex={-1}
                  value={totalDistance === 0 ? "" : Number(totalDistance.toFixed(2))}
                />
              </td>
              <td>
                <input
                  {...inputProps}
                  readOnly
                  tabIndex={-1}
                  style={{ background: '#f8f8f8' }}
                />
                <span className="hms-span">{
                  formatHoursToHMSFaded(
                    totalTimeSaved,
                    tableData.every(row => row[0] === 0 || row[1] === 0 || row[2] === 0)
                  )
                }</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ToolCard>
  );
}

export const dynamic = true; 