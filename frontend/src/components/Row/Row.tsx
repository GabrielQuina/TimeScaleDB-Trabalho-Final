import { CircleFill } from "react-bootstrap-icons";
import clsx from "clsx";

import type { DataCenter } from "../../types/DataCenter";

interface RowProps {
  dataCenter: DataCenter;
  onEdit: (row: DataCenter) => void;
  onDelete: (id: number) => void;
}

function Row({ dataCenter, onEdit, onDelete }: RowProps) {
  const dataCenterColor = clsx({
    "text-success": dataCenter.temperature <= 27,
    "text-warning":
      dataCenter.temperature > 27 && dataCenter.temperature < 35,
    "text-danger": dataCenter.temperature >= 35,
  });

  return (
    <tr>
      <td>{dataCenter.dataCenter}</td>

      <td>
        <div className="d-flex align-items-center justify-content-center">
          <CircleFill className={`me-2 ${dataCenterColor}`} size={10} />
          <span>{dataCenter.temperature}°C</span>
        </div>
      </td>

      <td>{dataCenter.sector}</td>
      <td>{dataCenter.room}</td>
      <td>{dataCenter.tags?.join(", ")}</td>
      <td>{dataCenter.metadata?.rack ?? "-"}</td>
      <td>
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-sm btn-outline-info" onClick={() => onEdit(dataCenter)}>
            Editar
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(dataCenter.id)}>
            Excluir
          </button>
        </div>
      </td>
    </tr>
  );
}

export default Row;
