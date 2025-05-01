import React from "react";
import styled from "styled-components";
import Modal from "./Modal";

const ProjectInfoContainer = styled.div`
  color: white;
`;

const ProjectTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const ProjectDetails = styled.div`
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
`;

const DetailRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
`;

const Dot = styled.span`
  display: inline-block;
  font-weight: bold;
  margin: 0 0.25rem;
`;

const ManageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: white;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const PersonIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

/**
 * ProjectInfoModal component to display project saved information
 * This replaces the auto-popup when clicking on a project
 * @param {object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to call when modal is closed
 * @param {object} props.projectInfo - Project information object
 */
const ProjectInfoModal = ({ isOpen, onClose, projectInfo = {} }) => {
  if (!projectInfo || Object.keys(projectInfo).length === 0) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Saved info"
    >
      <ProjectInfoContainer>
        <ProjectTitle>{projectInfo.name || "Project Details"}</ProjectTitle>
        
        <ProjectDetails>
          {projectInfo.info && (
            <DetailRow>
              {projectInfo.info}
            </DetailRow>
          )}
        </ProjectDetails>
        
        <ManageButton>
          <PersonIcon>👤</PersonIcon> Manage personal info
        </ManageButton>
      </ProjectInfoContainer>
    </Modal>
  );
};

export default ProjectInfoModal;