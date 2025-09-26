// Example usage with a unit
import { deleteUnit } from "@/actions/units/deleteUnit";
// import ActionColumn from "@/components/ActionColumn";

function UnitRow({ unit }) {
  const handleDeleteUnit = async () => {
    const res = await deleteUnit(unit.id);
    if (res?.ok) {
      window.location.reload();
    }
  };

  return (
    <div>
      {/* Other unit row content */}
      <NewActionColumn
        modelName="unit"
        editEndpoint={`/units/edit/${unit.id}`}
        onDelete={handleDeleteUnit}
      />
    </div>
  );
}

// Example usage with a saving
import { deleteSaving } from "@/actions/savings";
// import ActionColumn from "@/components/ActionColumn";

function SavingRow({ saving }) {
  const handleDeleteSaving = async () => {
    const res = await deleteSaving(saving.id);
    if (res?.ok) {
      window.location.reload();
    }
  };

  return (
    <div>
      {/* Other saving row content */}
      <NewActionColumn
        modelName="saving"
        editEndpoint={`/savings/edit/${saving.id}`}
        onDelete={handleDeleteSaving}
      />
    </div>
  );
}

// Example usage with a user
import { deleteUser } from "@/actions/users/deleteUser";
import NewActionColumn from "./NewActionColumn";
// import ActionColumn from "@/components/ActionColumn";

function UserRow({ user }) {
  const handleDeleteUser = async () => {
    const res = await deleteUser(user.id);
    if (res.data) {
      window.location.reload();
    }
  };

  return (
    <div>
      {/* Other user row content */}
      <NewActionColumn
        modelName="user"
        editEndpoint={`/users/edit/${user.id}`}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}