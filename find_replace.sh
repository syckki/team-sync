#!/bin/bash

# Create a temporary file
TMP_FILE=$(mktemp)

# Extract everything from report.js before the view mode section
sed -n '1,/isViewMode ? (/p' pages/view/[id]/report.js > $TMP_FILE

# Add our new component usage for view mode
cat >> $TMP_FILE << 'END'
            // Reports viewing mode
            <ReportViewer 
              threadTitle={threadTitle}
              reports={reports}
            />
END

# Add the else clause for form mode from the original file
sed -n '/Report submission form/,/^            <\/>/p' pages/view/[id]/report.js >> $TMP_FILE

# Replace the form mode code with our new component
sed -i 's|<ReportForm onSubmit={handleSubmit}>.*<\/ReportForm>|<ReportFormComponent\n                teamName={teamName}\n                teamMember={teamMember}\n                teamMemberOptions={teamMemberOptions}\n                teamRole={teamRole}\n                rows={rows}\n                onSubmit={handleSubmit}\n                setTeamMember={setTeamMember}\n                setTeamRole={setTeamRole}\n                handleRowChange={handleRowChange}\n                handleSDLCStepChange={handleSDLCStepChange}\n                addRow={addRow}\n                deleteRow={deleteRow}\n                isSubmitting={isSubmitting}\n                error={error}\n                success={success}\n              />|' $TMP_FILE

# Add the rest of the file after the form mode section
sed -n '/^          )}/,$p' pages/view/[id]/report.js >> $TMP_FILE

# Show the result
echo "--- First 50 lines of the modified file ---"
head -n 50 $TMP_FILE

echo "--- Last 50 lines of the modified file ---"
tail -n 50 $TMP_FILE

# Don't apply changes yet, just show the differences
echo "Differences (first 30 lines):"
diff -u <(head -n 1000 pages/view/[id]/report.js) <(head -n 1000 $TMP_FILE) | head -n 30
