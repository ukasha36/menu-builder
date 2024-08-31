import { Modal, Typography } from "antd";
import { useState } from "react";
import MenuBuilder from "react-dnd-menu-builder";
import { Button, Form, Input, Select, Space } from "antd";

function MenuBuilderX({
  menus,
  handleMenus,
}: {
  menus;
  handleMenus;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    href: "",
    children,
  });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    handleMenus([
      ...menus,
      {
        ...formData,
        id.random().toString(36).substring(7),
      },
    ]);
    setFormData({ id: "", name: "", href: "", children });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div style={{}}>
      <Button
        type="primary"
        onClick={() => {
          showModal();
        }}
      >
        Add Menu
      </Button>
      <MenuBuilder items={menus} setItems={handleMenus} />
      <Modal
        title="Add Menu"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Add"
      >
        <label
          style={{
            fontSize: "12px",
            color: "#1d1d1d7f",
          }}
          htmlFor=""
        >
          Menu Name
        </label>
        <Input
          placeholder="Home"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name.target.value })}
        />
        <div style={{ marginTop }}>
          <label
            style={{
              fontSize: "12px",
              color: "#1d1d1d7f",
            }}
            htmlFor=""
          >
            Menu Link
          </label>
          <Input
            placeholder="/home"
            value={formData.href}
            onChange={(e) => setFormData({ ...formData, href.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}

export default MenuBuilderX;
